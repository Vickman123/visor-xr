import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { ModelTransform, VRMode } from '../../types';

interface TwoHandManipulatorProps {
  vrMode: VRMode;
  transform: ModelTransform;
  onTransformChange: (updater: (prev: ModelTransform) => ModelTransform) => void;
  enabled?: boolean;
}

export const TwoHandManipulator: React.FC<TwoHandManipulatorProps> = ({
  vrMode,
  onTransformChange,
  enabled = true,
}) => {
  // Only active in 'maqueta' mode where model can be grabbed, moved and scaled
  const isMaqueta = vrMode === 'maqueta';

  // Interaction tracking refs
  const interactionModeRef = useRef<'single_right' | 'single_left' | 'dual' | null>(null);

  // Initial reference points
  const initialDistRef = useRef<number>(1);
  const initialAngleRef = useRef<number>(0);
  const initialMidpointRef = useRef(new THREE.Vector3());
  const initialSinglePosRef = useRef(new THREE.Vector3());

  // Cached vectors
  const leftPos = useRef(new THREE.Vector3());
  const rightPos = useRef(new THREE.Vector3());
  const currentMidpoint = useRef(new THREE.Vector3());

  useFrame((state, _delta, frame: any) => {
    if (!enabled || !isMaqueta) return;

    const session = state.gl.xr.getSession();
    const referenceSpace = state.gl.xr.getReferenceSpace();
    if (!session) return;

    let rightGrip = false;
    let leftGrip = false;
    let hasRightPos = false;
    let hasLeftPos = false;

    // 1. Read grip buttons and native WebXR poses directly from XRFrame & referenceSpace
    for (const source of session.inputSources) {
      if (!source.gamepad) continue;
      const gripBtn = source.gamepad.buttons[1]; // Squeeze / Grip button (index 1 in standard mapping)
      const isPressed = gripBtn ? gripBtn.pressed || gripBtn.value > 0.4 : false;

      // Get exact real-world 3D controller position
      const space = source.gripSpace || source.targetRaySpace;
      if (space && frame && referenceSpace) {
        const pose = frame.getPose(space, referenceSpace);
        if (pose && pose.transform) {
          const p = pose.transform.position;
          if (Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.z)) {
            if (source.handedness === 'right') {
              rightGrip = isPressed;
              rightPos.current.set(p.x, p.y, p.z);
              hasRightPos = true;
            } else if (source.handedness === 'left') {
              leftGrip = isPressed;
              leftPos.current.set(p.x, p.y, p.z);
              hasLeftPos = true;
            }
          }
        }
      }
    }

    // Fallback: If frame.getPose is not available, check Three.js controllers
    if (!hasRightPos || !hasLeftPos) {
      const c0 = state.gl.xr.getController(0);
      const c1 = state.gl.xr.getController(1);
      if (c0 && !hasRightPos) {
        c0.getWorldPosition(rightPos.current);
        if (rightPos.current.lengthSq() > 0.001) hasRightPos = true;
      }
      if (c1 && !hasLeftPos) {
        c1.getWorldPosition(leftPos.current);
        if (leftPos.current.lengthSq() > 0.001) hasLeftPos = true;
      }
    }

    // 2. DUAL HAND INTERACTION (Scale + Move + Rotate with both grips)
    if (rightGrip && leftGrip && hasRightPos && hasLeftPos) {
      const currentDist = leftPos.current.distanceTo(rightPos.current);
      if (currentDist < 0.04) return; // Ignore if hands are too close together

      currentMidpoint.current.copy(leftPos.current).add(rightPos.current).multiplyScalar(0.5);

      const dx = rightPos.current.x - leftPos.current.x;
      const dz = rightPos.current.z - leftPos.current.z;
      const currentAngle = Math.atan2(dx, dz);

      if (interactionModeRef.current !== 'dual') {
        interactionModeRef.current = 'dual';
        initialDistRef.current = currentDist;
        initialAngleRef.current = currentAngle;
        initialMidpointRef.current.copy(currentMidpoint.current);
        return;
      }

      // Compute safe scale ratio
      let scaleRatio = currentDist / initialDistRef.current;
      if (!Number.isFinite(scaleRatio) || scaleRatio < 0.1 || scaleRatio > 10.0) {
        scaleRatio = 1.0;
      }
      initialDistRef.current = currentDist;

      // Compute angle delta around Y (normalized to [-PI, PI])
      let angleDelta = currentAngle - initialAngleRef.current;
      if (angleDelta > Math.PI) angleDelta -= Math.PI * 2;
      if (angleDelta < -Math.PI) angleDelta += Math.PI * 2;
      initialAngleRef.current = currentAngle;

      // Compute midpoint translation
      const moveX = currentMidpoint.current.x - initialMidpointRef.current.x;
      const moveY = currentMidpoint.current.y - initialMidpointRef.current.y;
      const moveZ = currentMidpoint.current.z - initialMidpointRef.current.z;
      initialMidpointRef.current.copy(currentMidpoint.current);

      // Guard against wild jump glitches (> 0.5m in single frame)
      if (Math.abs(moveX) > 0.5 || Math.abs(moveY) > 0.5 || Math.abs(moveZ) > 0.5) {
        return;
      }

      onTransformChange((prev) => {
        const currentScale = prev.scale[0] || 1.0;
        const newScale = Math.min(Math.max(currentScale * scaleRatio, 0.1), 8.0);
        if (!Number.isFinite(newScale)) return prev;

        const nx = prev.position[0] + moveX;
        const ny = prev.position[1] + moveY;
        const nz = prev.position[2] + moveZ;
        if (!Number.isFinite(nx) || !Number.isFinite(ny) || !Number.isFinite(nz)) return prev;

        return {
          position: [nx, ny, nz],
          rotation: [prev.rotation[0], prev.rotation[1] + angleDelta, prev.rotation[2]],
          scale: [newScale, newScale, newScale],
        };
      });
    }
    // 3. SINGLE HAND INTERACTION (Grab and Move with EITHER hand)
    else if ((rightGrip && hasRightPos) || (leftGrip && hasLeftPos)) {
      const isRight = rightGrip && hasRightPos;
      const activePos = isRight ? rightPos.current : leftPos.current;
      const modeKey = isRight ? 'single_right' : 'single_left';

      if (interactionModeRef.current !== modeKey) {
        interactionModeRef.current = modeKey;
        initialSinglePosRef.current.copy(activePos);
        return;
      }

      const deltaX = activePos.x - initialSinglePosRef.current.x;
      const deltaY = activePos.y - initialSinglePosRef.current.y;
      const deltaZ = activePos.z - initialSinglePosRef.current.z;
      initialSinglePosRef.current.copy(activePos);

      // Guard against wild jump glitches (> 0.5m in single frame)
      if (Math.abs(deltaX) > 0.5 || Math.abs(deltaY) > 0.5 || Math.abs(deltaZ) > 0.5) {
        return;
      }

      onTransformChange((prev) => {
        const nx = prev.position[0] + deltaX;
        const ny = prev.position[1] + deltaY;
        const nz = prev.position[2] + deltaZ;
        if (!Number.isFinite(nx) || !Number.isFinite(ny) || !Number.isFinite(nz)) return prev;

        return {
          ...prev,
          position: [nx, ny, nz],
        };
      });
    }
    // 4. RELEASED
    else {
      interactionModeRef.current = null;
    }
  });

  return null;
};

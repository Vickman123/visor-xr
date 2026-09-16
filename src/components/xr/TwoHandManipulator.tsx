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
  // Only active in 'maqueta' mode where model can be grabbed and scaled
  const isMaqueta = vrMode === 'maqueta';

  // Interaction tracking refs
  const isInteractingRef = useRef(false);
  const interactionModeRef = useRef<'single' | 'dual' | null>(null);

  // Initial reference points
  const initialDistRef = useRef<number>(1);
  const initialAngleRef = useRef<number>(0);
  const initialMidpointRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const initialRightPosRef = useRef<THREE.Vector3>(new THREE.Vector3());

  // Cached vectors to prevent GC allocations in render loop
  const leftPos = useRef(new THREE.Vector3());
  const rightPos = useRef(new THREE.Vector3());
  const midpoint = useRef(new THREE.Vector3());

  useFrame((state) => {
    if (!enabled || !isMaqueta) return;

    const session = state.gl.xr.getSession();
    if (!session) return;

    let rightGripPressed = false;
    let leftGripPressed = false;

    // Read input sources from WebXR session
    for (const source of session.inputSources) {
      if (!source.gamepad) continue;
      const gripBtn = source.gamepad.buttons[1]; // Squeeze / Grip button
      const isPressed = gripBtn ? gripBtn.pressed || gripBtn.value > 0.5 : false;

      if (source.handedness === 'right') {
        rightGripPressed = isPressed;
      } else if (source.handedness === 'left') {
        leftGripPressed = isPressed;
      }
    }

    // Get controller positions from Three.js XR manager
    // Controller 0 and 1 represent the active XR controllers
    const ctrl0 = state.gl.xr.getController(0);
    const ctrl1 = state.gl.xr.getController(1);

    // Get world positions
    ctrl0.getWorldPosition(rightPos.current);
    ctrl1.getWorldPosition(leftPos.current);

    // If both hands grip: DUAL HAND MANIPULATION (Scale, Move, Rotate)
    if (rightGripPressed && leftGripPressed) {
      const currentDist = leftPos.current.distanceTo(rightPos.current);
      midpoint.current.copy(leftPos.current).add(rightPos.current).multiplyScalar(0.5);

      const dx = rightPos.current.x - leftPos.current.x;
      const dz = rightPos.current.z - leftPos.current.z;
      const currentAngle = Math.atan2(dx, dz);

      if (interactionModeRef.current !== 'dual') {
        // Start dual interaction
        interactionModeRef.current = 'dual';
        isInteractingRef.current = true;
        initialDistRef.current = Math.max(currentDist, 0.05);
        initialAngleRef.current = currentAngle;
        initialMidpointRef.current.copy(midpoint.current);
      } else {
        // Update scale
        const scaleFactorDelta = currentDist / initialDistRef.current;
        initialDistRef.current = currentDist; // incremental update

        // Update angle (rotation around Y)
        const angleDelta = currentAngle - initialAngleRef.current;
        initialAngleRef.current = currentAngle;

        // Update translation (midpoint delta)
        const moveDeltaX = midpoint.current.x - initialMidpointRef.current.x;
        const moveDeltaY = midpoint.current.y - initialMidpointRef.current.y;
        const moveDeltaZ = midpoint.current.z - initialMidpointRef.current.z;
        initialMidpointRef.current.copy(midpoint.current);

        onTransformChange((prev) => {
          const newScaleVal = Math.min(Math.max(prev.scale[0] * scaleFactorDelta, 0.1), 10.0);
          return {
            position: [
              prev.position[0] + moveDeltaX,
              prev.position[1] + moveDeltaY,
              prev.position[2] + moveDeltaZ,
            ],
            rotation: [
              prev.rotation[0],
              prev.rotation[1] + angleDelta,
              prev.rotation[2],
            ],
            scale: [newScaleVal, newScaleVal, newScaleVal],
          };
        });
      }
    }
    // Single Right Hand Grip: GRAB & MOVE
    else if (rightGripPressed) {
      if (interactionModeRef.current !== 'single') {
        interactionModeRef.current = 'single';
        isInteractingRef.current = true;
        initialRightPosRef.current.copy(rightPos.current);
      } else {
        const deltaX = rightPos.current.x - initialRightPosRef.current.x;
        const deltaY = rightPos.current.y - initialRightPosRef.current.y;
        const deltaZ = rightPos.current.z - initialRightPosRef.current.z;
        initialRightPosRef.current.copy(rightPos.current);

        onTransformChange((prev) => ({
          ...prev,
          position: [
            prev.position[0] + deltaX,
            prev.position[1] + deltaY,
            prev.position[2] + deltaZ,
          ],
        }));
      }
    } else {
      // Released
      interactionModeRef.current = null;
      isInteractingRef.current = false;
    }
  });

  return null;
};

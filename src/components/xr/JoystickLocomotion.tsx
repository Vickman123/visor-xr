import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { VRMode, VRLocomotionMode } from '../../types';

interface JoystickLocomotionProps {
  vrMode: VRMode;
  locomotionMode: VRLocomotionMode;
  originRef: React.RefObject<THREE.Group | null>;
  moveSpeed?: number;
}

export const JoystickLocomotion: React.FC<JoystickLocomotionProps> = ({
  vrMode,
  locomotionMode,
  originRef,
  moveSpeed = 2.5, // 2.5 meters/second
}) => {
  // Only active in Escala 1:1 mode when locomotion mode includes joystick
  const isActive = vrMode === 'escala1_1' && locomotionMode === 'joystick';

  // Snap turn cooldown tracking
  const lastSnapTimeRef = useRef<number>(0);
  const snapCooldownMs = 350;

  // Reusable vectors for performance
  const forwardVec = useRef(new THREE.Vector3());
  const rightVec = useRef(new THREE.Vector3());
  const moveDirection = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    if (!isActive || !originRef.current) return;

    const session = state.gl.xr.getSession();
    if (!session) return;

    let moveX = 0;
    let moveZ = 0;
    let turnX = 0;

    for (const source of session.inputSources) {
      if (!source.gamepad) continue;
      const axes = source.gamepad.axes;

      // Meta Quest Touch Controller axes mapping:
      // Typically axes[2] is Thumbstick X, axes[3] is Thumbstick Y
      // Fallback to axes[0] and axes[1] if axes.length <= 2
      const stickX = axes.length > 2 ? axes[2] : axes[0] || 0;
      const stickY = axes.length > 3 ? axes[3] : axes[1] || 0;

      // Apply deadzone
      const deadzone = 0.15;
      const filteredX = Math.abs(stickX) > deadzone ? stickX : 0;
      const filteredY = Math.abs(stickY) > deadzone ? stickY : 0;

      if (source.handedness === 'left') {
        // Left thumbstick: Locomotion (move forward/backward, strafe left/right)
        moveX = filteredX;
        moveZ = filteredY;
      } else if (source.handedness === 'right') {
        // Right thumbstick: Snap turn
        turnX = filteredX;
      }
    }

    // 1. Handle Smooth Movement (Left Stick)
    if (Math.abs(moveX) > 0 || Math.abs(moveZ) > 0) {
      // Get camera yaw direction in world space
      state.camera.getWorldDirection(forwardVec.current);
      forwardVec.current.y = 0; // Flatten on ground plane
      forwardVec.current.normalize();

      // Right vector is perpendicular to forward
      rightVec.current.crossVectors(forwardVec.current, new THREE.Vector3(0, 1, 0)).normalize();

      // Combine directions: moveZ is forward/back (-1 is push forward), moveX is strafe (+1 is right)
      moveDirection.current
        .copy(forwardVec.current)
        .multiplyScalar(-moveZ)
        .addScaledVector(rightVec.current, moveX)
        .normalize()
        .multiplyScalar(moveSpeed * delta);

      originRef.current.position.add(moveDirection.current);
    }

    // 2. Handle Snap Turn (Right Stick)
    const now = performance.now();
    if (Math.abs(turnX) > 0.65 && now - lastSnapTimeRef.current > snapCooldownMs) {
      lastSnapTimeRef.current = now;
      // 45 degrees snap turn in radians
      const snapAngle = (turnX > 0 ? -1 : 1) * (Math.PI / 4);
      originRef.current.rotation.y += snapAngle;
    }
  });

  return null;
};

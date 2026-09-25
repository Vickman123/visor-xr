import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface GyroscopeCameraProps {
  enabled: boolean;
  onPermissionDenied?: () => void;
}

/**
 * Gyroscope Camera for Mobile Devices.
 * "Dejar quieto el modelo y movernos alrededor con el móvil":
 * Keeps model fixed at [0, 0, 0] while driving camera viewing orientation
 * directly from the device's physical gyroscope and accelerometer.
 */
export const GyroscopeCamera: React.FC<GyroscopeCameraProps> = ({ enabled }) => {
  const { camera } = useThree();
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const targetQuaternion = useRef(new THREE.Quaternion());
  const initialAlpha = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha === null || e.beta === null || e.gamma === null) return;

      if (initialAlpha.current === null) {
        initialAlpha.current = e.alpha;
      }

      // Convert device rotation angles to radians
      // alpha: rotation around Z axis (compass) [0, 360]
      // beta: rotation around X axis (front/back tilt) [-180, 180]
      // gamma: rotation around Y axis (left/right tilt) [-90, 90]
      const alphaRad = THREE.MathUtils.degToRad(e.alpha - (initialAlpha.current || 0));
      const betaRad = THREE.MathUtils.degToRad(e.beta - 45); // comfortable handheld viewing angle
      const gammaRad = THREE.MathUtils.degToRad(-e.gamma);

      euler.current.set(betaRad, alphaRad, gammaRad, 'YXZ');
      targetQuaternion.current.setFromEuler(euler.current);
    };

    window.addEventListener('deviceorientation', handleOrientation);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      initialAlpha.current = null;
    };
  }, [enabled]);

  useFrame(() => {
    if (!enabled) return;
    // Slerp camera quaternion smoothly
    camera.quaternion.slerp(targetQuaternion.current, 0.15);
  });

  return null;
};

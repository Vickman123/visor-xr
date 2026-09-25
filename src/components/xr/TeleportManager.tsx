import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { VRMode, VRLocomotionMode } from '../../types';

interface TeleportManagerProps {
  vrMode: VRMode;
  locomotionMode: VRLocomotionMode;
  originRef: React.RefObject<THREE.Group | null>;
  onTeleport?: (pos: THREE.Vector3) => void;
}

export const TeleportManager: React.FC<TeleportManagerProps> = ({
  vrMode,
  locomotionMode,
  originRef,
  onTeleport,
}) => {
  const isActive = vrMode === 'escala1_1' && locomotionMode === 'teleport';

  const [isAiming, setIsAiming] = useState(false);
  const [reticlePos, setReticlePos] = useState<[number, number, number]>([0, 0.02, 0]);

  // Raycasting references
  const raycaster = useRef(new THREE.Raycaster());
  const groundPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const intersectionPoint = useRef(new THREE.Vector3());
  const wasTriggerPressed = useRef(false);

  // Line points for ray visualization
  const linePoints = useRef<[THREE.Vector3, THREE.Vector3]>([
    new THREE.Vector3(),
    new THREE.Vector3(),
  ]);
  const lineRef = useRef<THREE.Line | null>(null);

  useFrame((state) => {
    if (!isActive || !originRef.current) {
      if (isAiming) setIsAiming(false);
      return;
    }

    const session = state.gl.xr.getSession();
    if (!session) return;

    let triggerActive = false;

    // Check right controller trigger or thumbstick forward for teleport aim
    for (const source of session.inputSources) {
      if (source.handedness === 'right' && source.gamepad) {
        const trigger = source.gamepad.buttons[0]; // Index trigger
        const thumbstickY = source.gamepad.axes.length > 3 ? source.gamepad.axes[3] : source.gamepad.axes[1] || 0;
        // Trigger pressed OR thumbstick pushed forward
        triggerActive = (trigger && trigger.pressed) || thumbstickY < -0.6;
      }
    }

    const rightController = state.gl.xr.getController(0);

    if (triggerActive) {
      // User is aiming teleport
      setIsAiming(true);

      // Cast ray from controller direction
      const tempMatrix = new THREE.Matrix4();
      tempMatrix.extractRotation(rightController.matrixWorld);

      const rayDir = new THREE.Vector3(0, 0, -1).applyMatrix4(tempMatrix).normalize();
      // Tilt ray slightly downward if pointing straight ahead to form natural arc
      rayDir.y -= 0.2;
      rayDir.normalize();

      const controllerPos = new THREE.Vector3();
      rightController.getWorldPosition(controllerPos);

      raycaster.current.set(controllerPos, rayDir);

      const hit = raycaster.current.ray.intersectPlane(groundPlane.current, intersectionPoint.current);

      if (hit && intersectionPoint.current.distanceTo(controllerPos) < 25) {
        setReticlePos([
          intersectionPoint.current.x,
          0.02,
          intersectionPoint.current.z,
        ]);

        // Update visual line
        linePoints.current[0].copy(controllerPos);
        linePoints.current[1].copy(intersectionPoint.current);

        if (lineRef.current) {
          lineRef.current.geometry.setFromPoints(linePoints.current);
        }
      }
    } else if (wasTriggerPressed.current && isAiming) {
      // Trigger was just released: EXECUTE TELEPORT
      if (originRef.current) {
        originRef.current.position.set(reticlePos[0], 0, reticlePos[2]);
        if (onTeleport) {
          onTeleport(new THREE.Vector3(reticlePos[0], 0, reticlePos[2]));
        }
      }
      setIsAiming(false);
    }

    wasTriggerPressed.current = triggerActive;
  });

  if (!isActive || !isAiming) return null;

  return (
    <group>
      {/* Teleport Landing Reticle */}
      <group position={reticlePos}>
        {/* Outer pulse ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.35, 0.45, 32]} />
          <meshBasicMaterial color="#0ea5e9" opacity={0.8} transparent side={THREE.DoubleSide} />
        </mesh>
        {/* Inner target disc */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.2, 32]} />
          <meshBasicMaterial color="#38bdf8" opacity={0.6} transparent side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Aiming Arc / Beam */}
      <primitive
        object={
          new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(linePoints.current),
            new THREE.LineBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.75 })
          )
        }
        ref={lineRef}
      />
    </group>
  );
};

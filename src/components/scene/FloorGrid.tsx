import React from 'react';
import { Grid } from '@react-three/drei';
import { TeleportTarget } from '@react-three/xr';
import * as THREE from 'three';

interface FloorGridProps {
  isVR?: boolean;
  isAR?: boolean;
  vrMode?: 'maqueta' | 'escala1_1';
  onTeleport?: (point: THREE.Vector3) => void;
}

export const FloorGrid: React.FC<FloorGridProps> = ({
  isVR = false,
  isAR = false,
  vrMode = 'maqueta',
  onTeleport,
}) => {
  const isScale1to1 = isVR && vrMode === 'escala1_1';

  return (
    <group position={[0, -0.01, 0]}>
      {/* Subtle floor grid (Only shown in PC desktop and fully immersive VR, hidden in AR passthrough) */}
      {!isAR && (
        <Grid
          position={[0, 0, 0]}
          args={[80, 80]}
          cellSize={1}
          cellThickness={0.6}
          cellColor="#4b5563"
          sectionSize={5}
          sectionThickness={1.2}
          sectionColor="#9ca3af"
          fadeDistance={40}
          fadeStrength={1.5}
          infiniteGrid
        />
      )}

      {/* Shadow-catching ground plane (Casts shadows on real-world floor/table in AR) */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.005, 0]}
        receiveShadow
      >
        <planeGeometry args={[100, 100]} />
        <shadowMaterial opacity={isAR ? 0.45 : 0.25} />
      </mesh>

      {/* In VR/AR Escala 1:1, provide TeleportTarget surface for locomotion */}
      {isScale1to1 && (
        <TeleportTarget
          onTeleport={(target) => {
            if (onTeleport && target) {
              onTeleport(target);
            }
          }}
        >
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -0.01, 0]}
            visible={false}
          >
            <planeGeometry args={[200, 200]} />
            <meshBasicMaterial />
          </mesh>
        </TeleportTarget>
      )}

      {/* Tabletop diorama pedestal in immersive VR Modo Maqueta (hidden in AR so model sits directly on real table) */}
      {isVR && !isAR && vrMode === 'maqueta' && (
        <group position={[0, 0, -0.8]}>
          <mesh position={[0, 0.45, 0]} receiveShadow>
            <cylinderGeometry args={[0.8, 0.85, 0.9, 32]} />
            <meshStandardMaterial
              color="#1e293b"
              roughness={0.7}
              metalness={0.1}
            />
          </mesh>
          <mesh position={[0, 0.905, 0]}>
            <cylinderGeometry args={[0.82, 0.82, 0.02, 32]} />
            <meshStandardMaterial
              color="#0ea5e9"
              roughness={0.3}
              metalness={0.5}
            />
          </mesh>
        </group>
      )}
    </group>
  );
};

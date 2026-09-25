import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import type { Project } from '../../types';

interface MuseumGalleryProps {
  projects: Project[];
  activeModelScene: THREE.Group | null;
  currentProjectId?: string;
  onSelectProject?: (project: Project) => void;
}

/**
 * Experimental Modo Museo VR for Meta Quest.
 * Creates an architectural gallery with circular pedestals where all buildings
 * can be exhibited in 3D space, allowing users to walk or teleport between them.
 */
export const MuseumGallery: React.FC<MuseumGalleryProps> = ({
  projects,
  activeModelScene,
  currentProjectId,
  onSelectProject,
}) => {
  const radius = 7.5;
  const count = projects.length || 6;

  const pedestals = useMemo(() => {
    return projects.map((p, index) => {
      const angle = (index / count) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const rotY = -angle - Math.PI / 2;
      return { project: p, x, z, rotY, index };
    });
  }, [projects, count, radius]);

  return (
    <group name="MuseumGalleryRoot">
      {/* Central circular floor marker */}
      <mesh position={[0, -0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius - 1.2, radius + 1.2, 48]} />
        <meshBasicMaterial color="#0ea5e9" transparent opacity={0.15} />
      </mesh>

      {/* Pedestals with 3D Titles and Models */}
      {pedestals.map(({ project, x, z, rotY }) => {
        const isCurrent = project.id === currentProjectId;

        return (
          <group
            key={project.id}
            position={[x, 0, z]}
            rotation={[0, rotY, 0]}
            onClick={(e) => {
              e.stopPropagation();
              if (onSelectProject) onSelectProject(project);
            }}
          >
            {/* Architectural Column Pedestal */}
            <mesh position={[0, 0.45, 0]}>
              <cylinderGeometry args={[1.2, 1.35, 0.9, 32]} />
              <meshStandardMaterial
                color={isCurrent ? '#1e293b' : '#0f172a'}
                roughness={0.6}
                metalness={0.2}
              />
            </mesh>

            {/* Glowing top rim */}
            <mesh position={[0, 0.905, 0]}>
              <cylinderGeometry args={[1.22, 1.22, 0.02, 32]} />
              <meshStandardMaterial
                color={isCurrent ? '#06b6d4' : '#334155'}
                roughness={0.2}
                metalness={0.5}
              />
            </mesh>

            {/* Front Architectural Title Plaque */}
            <group position={[0, 0.45, 1.36]} rotation={[0.2, 0, 0]}>
              <mesh position={[0, 0, -0.005]}>
                <boxGeometry args={[1.5, 0.28, 0.02]} />
                <meshStandardMaterial color="#090d16" roughness={0.4} metalness={0.3} />
              </mesh>
              <Text
                position={[0, 0.04, 0.01]}
                fontSize={0.07}
                maxWidth={1.4}
                color={isCurrent ? '#38bdf8' : '#e2e8f0'}
                anchorX="center"
                anchorY="middle"
              >
                {project.name}
              </Text>
              <Text
                position={[0, -0.06, 0.01]}
                fontSize={0.04}
                color="#64748b"
                anchorX="center"
                anchorY="middle"
              >
                {project.category || 'Arquitectura UNAM'}
              </Text>
            </group>

            {/* If this is the currently loaded active model, place it right on the pedestal! */}
            {isCurrent && activeModelScene && (
              <group position={[0, 0.92, 0]} scale={[0.15, 0.15, 0.15]}>
                <primitive object={activeModelScene} />
              </group>
            )}
          </group>
        );
      })}
    </group>
  );
};

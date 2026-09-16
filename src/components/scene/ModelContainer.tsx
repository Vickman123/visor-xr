import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';
import type { ModelTransform, VRMode } from '../../types';

interface ModelContainerProps {
  scene: THREE.Group | null;
  transform: ModelTransform;
  isVR?: boolean;
  vrMode?: VRMode;
  recommendedScale?: number;
}

export interface ModelContainerHandle {
  groupRef: React.RefObject<THREE.Group | null>;
}

export const ModelContainer = forwardRef<ModelContainerHandle, ModelContainerProps>(
  ({ scene, transform, isVR = false, vrMode = 'maqueta', recommendedScale = 1.0 }, ref) => {
    const groupRef = useRef<THREE.Group | null>(null);

    useImperativeHandle(ref, () => ({
      groupRef,
    }));

    if (!scene) return null;

    // Calculate effective transform based on VR mode or desktop mode
    let effectivePos: [number, number, number] = transform.position;
    let effectiveRot: [number, number, number] = transform.rotation;
    let effectiveScale: [number, number, number] = transform.scale;

    if (isVR) {
      if (vrMode === 'maqueta') {
        // Tabletop diorama: on top of the pedestal (y ~ 0.92, z ~ -0.8)
        const dioramaScale = recommendedScale * transform.scale[0];
        effectivePos = [
          transform.position[0],
          transform.position[1] + 0.92,
          transform.position[2] - 0.8,
        ];
        effectiveScale = [dioramaScale, dioramaScale, dioramaScale];
      } else {
        // Escala 1:1: Realistic 1:1 architectural scale at ground level
        effectivePos = [transform.position[0], 0, transform.position[2]];
        effectiveScale = [1.0, 1.0, 1.0];
      }
    }

    return (
      <group
        ref={groupRef}
        position={effectivePos}
        rotation={effectiveRot}
        scale={effectiveScale}
      >
        <primitive object={scene} />
      </group>
    );
  }
);

ModelContainer.displayName = 'ModelContainer';

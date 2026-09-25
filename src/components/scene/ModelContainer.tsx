import React, { useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import * as THREE from 'three';
import type { ModelTransform, VRMode } from '../../types';
import { setSceneMaquetaMode } from '../../utils/meshOptimizer';

interface ModelContainerProps {
  scene: THREE.Group | null;
  transform: ModelTransform;
  isVR?: boolean;
  vrMode?: VRMode;
  recommendedScale?: number;
  wireframe?: boolean;
  maquetaMode?: boolean;
}

export interface ModelContainerHandle {
  groupRef: React.RefObject<THREE.Group | null>;
}

export const ModelContainer = forwardRef<ModelContainerHandle, ModelContainerProps>(
  ({ scene, transform, isVR = false, vrMode = 'maqueta', recommendedScale = 1.0, wireframe = false, maquetaMode = false }, ref) => {
    const groupRef = useRef<THREE.Group | null>(null);

    // Apply architectural clay maqueta mode
    useEffect(() => {
      if (!scene) return;
      setSceneMaquetaMode(scene, maquetaMode);
    }, [scene, maquetaMode]);

    React.useEffect(() => {
      if (!scene) return;
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.material) {
            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            mats.forEach((m) => {
              if ('wireframe' in m) {
                (m as THREE.MeshStandardMaterial).wireframe = wireframe;
              }
            });
          }
        }
      });
    }, [scene, wireframe]);

    useImperativeHandle(ref, () => ({
      groupRef,
    }));

    if (!scene) return null;

    // Safe finite numbers check
    const posX = Number.isFinite(transform.position[0]) ? transform.position[0] : 0;
    const posY = Number.isFinite(transform.position[1]) ? transform.position[1] : 0;
    const posZ = Number.isFinite(transform.position[2]) ? transform.position[2] : 0;

    const rotX = Number.isFinite(transform.rotation[0]) ? transform.rotation[0] : 0;
    const rotY = Number.isFinite(transform.rotation[1]) ? transform.rotation[1] : 0;
    const rotZ = Number.isFinite(transform.rotation[2]) ? transform.rotation[2] : 0;

    const scaleFactor = Number.isFinite(transform.scale[0]) && transform.scale[0] > 0 ? transform.scale[0] : 1.0;
    const baseRecommended = Number.isFinite(recommendedScale) && (recommendedScale ?? 1.0) > 0 ? (recommendedScale ?? 1.0) : 1.0;

    // Calculate effective transform based on VR mode or desktop mode
    let effectivePos: [number, number, number] = [posX, posY, posZ];
    let effectiveRot: [number, number, number] = [rotX, rotY, rotZ];
    let effectiveScale: [number, number, number] = [scaleFactor, scaleFactor, scaleFactor];

    if (isVR) {
      if (vrMode === 'maqueta') {
        // Tabletop diorama: on top of the pedestal (y ~ 0.92, z ~ -0.8)
        const dioramaScale = baseRecommended * scaleFactor;
        effectivePos = [
          posX,
          posY + 0.92,
          posZ - 0.8,
        ];
        effectiveScale = [dioramaScale, dioramaScale, dioramaScale];
      } else {
        // Escala 1:1: Realistic 1:1 architectural scale at ground level
        effectivePos = [posX, 0, posZ];
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

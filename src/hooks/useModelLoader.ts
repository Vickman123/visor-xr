import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { computeModelMetrics } from '../utils/modelMetrics';
import { mergeSceneSubMeshes } from '../utils/meshOptimizer';
import type { ModelMetrics } from '../types';

interface UseModelLoaderResult {
  scene: THREE.Group | null;
  metrics: ModelMetrics | null;
  isLoading: boolean;
  progress: number;
  error: string | null;
}

export function useModelLoader(modelSource: string | File | null): UseModelLoaderResult {
  const [scene, setScene] = useState<THREE.Group | null>(null);
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const prevBlobUrlRef = useRef<string | null>(null);
  const currentSceneRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!modelSource) {
      setScene(null);
      setMetrics(null);
      setError(null);
      setIsLoading(false);
      setProgress(0);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setProgress(0);
    setError(null);

    // Clean up previous blob URL if exists
    if (prevBlobUrlRef.current) {
      URL.revokeObjectURL(prevBlobUrlRef.current);
      prevBlobUrlRef.current = null;
    }

    // Clean up previous scene geometries and materials
    if (currentSceneRef.current) {
      currentSceneRef.current.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          if (mesh.geometry) mesh.geometry.dispose();
          if (mesh.material) {
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((m) => m.dispose());
            } else {
              mesh.material.dispose();
            }
          }
        }
      });
      currentSceneRef.current = null;
    }

    let urlToLoad = '';
    let fileSizeBytes: number | undefined;

    if (typeof modelSource === 'string') {
      // If relative, resolve with Vite base URL if necessary
      const baseUrl = import.meta.env.BASE_URL || '/';
      const resolved = modelSource.startsWith('http') || modelSource.startsWith('blob:')
        ? modelSource
        : `${baseUrl}${modelSource.startsWith('/') ? modelSource.slice(1) : modelSource}`;
      urlToLoad = encodeURI(resolved);
    } else if (modelSource instanceof File) {
      urlToLoad = URL.createObjectURL(modelSource);
      prevBlobUrlRef.current = urlToLoad;
      fileSizeBytes = modelSource.size;
    }

    // Setup GLTF Loader with Draco Support
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      urlToLoad,
      (gltf) => {
        if (!isMounted) return;

        let sceneToProcess = gltf.scene;

        // Count total sub-meshes
        let subMeshCount = 0;
        sceneToProcess.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) subMeshCount++;
        });

        // If scene has fragmented sub-meshes (e.g. 112,000 nodes from CAD/SketchUp), merge geometries by material to reduce draw calls
        if (subMeshCount > 100) {
          sceneToProcess = mergeSceneSubMeshes(sceneToProcess);
        }

        currentSceneRef.current = sceneToProcess;

        // Optimize meshes & materials for high aesthetic visualization & 60-120 FPS performance
        sceneToProcess.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.frustumCulled = true;
            // Disable shadow casting on 1M triangle dense meshes to prevent GPU frame drops on PC & Quest OOM crashes
            mesh.castShadow = false;
            mesh.receiveShadow = false;

            // Delete unused heavy tangent attributes (saves ~11MB of VRAM per model on Meta Quest)
            if (mesh.geometry) {
              if (mesh.geometry.attributes.tangent) {
                mesh.geometry.deleteAttribute('tangent');
              }
              // Recompute vertex normals if missing
              if (!mesh.geometry.attributes.normal) {
                mesh.geometry.computeVertexNormals();
              }
            }

            // Material optimizations: enable hardware backface culling and smooth textures
            if (mesh.material) {
              const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
              materials.forEach((mat) => {
                const isTransparent = mat.transparent === true || (mat.opacity !== undefined && mat.opacity < 0.8);

                // Enable GPU hardware backface culling for opaque surfaces to discard 50% of triangles
                mat.side = isTransparent ? THREE.DoubleSide : THREE.FrontSide;

                // Fix models exported with opacity 0.8 on solid surfaces (making walls see-through)
                if (mat.opacity >= 0.75) {
                  mat.opacity = 1.0;
                  mat.transparent = false;
                  mat.depthWrite = true;
                  mat.depthTest = true;
                }

                // Balance texture crispness without overloading mobile VR sampler cache
                const stdMat = mat as THREE.MeshStandardMaterial;
                if (stdMat.map) {
                  stdMat.map.anisotropy = 2;
                }
                if (stdMat.emissiveMap) {
                  stdMat.emissiveMap.anisotropy = 2;
                  stdMat.emissiveIntensity = 1.0;
                }
              });
            }
          }
        });

        // Compute model metrics and bounding box
        const calculatedMetrics = computeModelMetrics(sceneToProcess, fileSizeBytes);

        // Apply autoFitScale so giant models (e.g. 7.5 km CAD exports) or tiny mm models load at ~6m maqueta scale
        const autoFit = calculatedMetrics.autoFitScale ?? 1.0;
        if (autoFit !== 1.0) {
          sceneToProcess.scale.set(autoFit, autoFit, autoFit);
        }

        // Ground alignment: center bounding box at X=0, Z=0 and align bottom to Y=0
        const box = new THREE.Box3().setFromObject(sceneToProcess);
        const center = new THREE.Vector3();
        box.getCenter(center);
        sceneToProcess.position.set(-center.x, -box.min.y, -center.z);

        // Wrap inside a root group so that transforms remain clean and normalized
        const containerGroup = new THREE.Group();
        containerGroup.name = 'ModelRootContainer';
        containerGroup.add(sceneToProcess);

        setScene(containerGroup);
        setMetrics(calculatedMetrics);
        setIsLoading(false);
        setProgress(100);
      },
      (xhr) => {
        if (!isMounted) return;
        if (xhr.total > 0) {
          const percent = Math.round((xhr.loaded / xhr.total) * 100);
          setProgress(percent);
        } else {
          setProgress(50);
        }
      },
      (err) => {
        if (!isMounted) return;
        console.error('Error loading 3D model:', err);
        setError('No se pudo cargar el modelo. Verifica que el archivo sea un GLB/GLTF válido.');
        setIsLoading(false);
      }
    );

    return () => {
      isMounted = false;
      dracoLoader.dispose();
      if (prevBlobUrlRef.current) {
        URL.revokeObjectURL(prevBlobUrlRef.current);
        prevBlobUrlRef.current = null;
      }
    };
  }, [modelSource]);

  return { scene, metrics, isLoading, progress, error };
}

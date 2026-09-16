import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { computeModelMetrics } from '../utils/modelMetrics';
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
      urlToLoad = modelSource.startsWith('http') || modelSource.startsWith('blob:')
        ? modelSource
        : `${baseUrl}${modelSource.startsWith('/') ? modelSource.slice(1) : modelSource}`;
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

        const loadedScene = gltf.scene;
        currentSceneRef.current = loadedScene;

        // Optimize meshes for Meta Quest 3S:
        // Enable frustum culling, cast/receive shadow flags, tone mapping
        loadedScene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.frustumCulled = true;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
          }
        });

        // Compute model metrics and bounding box
        const calculatedMetrics = computeModelMetrics(loadedScene, fileSizeBytes);

        // Ground alignment: align bottom of bounding box to Y = 0
        const box = new THREE.Box3().setFromObject(loadedScene);
        loadedScene.position.set(-calculatedMetrics.center[0], -box.min.y, -calculatedMetrics.center[2]);

        // Wrap inside a root group so that transforms remain clean and normalized
        const containerGroup = new THREE.Group();
        containerGroup.name = 'ModelRootContainer';
        containerGroup.add(loadedScene);

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

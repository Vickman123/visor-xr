import * as THREE from 'three';
import type { ModelMetrics } from '../types';

export function computeModelMetrics(object: THREE.Object3D, fileSizeBytes?: number): ModelMetrics {
  // Ensure matrices are updated
  object.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  box.getSize(size);

  const center = new THREE.Vector3();
  box.getCenter(center);

  let vertexCount = 0;
  let triangleCount = 0;
  let meshCount = 0;

  object.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      meshCount++;
      const mesh = child as THREE.Mesh;
      const geometry = mesh.geometry;
      if (geometry) {
        if (geometry.attributes.position) {
          vertexCount += geometry.attributes.position.count;
        }
        if (geometry.index) {
          triangleCount += geometry.index.count / 3;
        } else if (geometry.attributes.position) {
          triangleCount += geometry.attributes.position.count / 3;
        }
      }
    }
  });

  // Thresholds for Quest 3S mobile performance warning
  // Quest 3S runs comfortably up to ~250k - 500k polygons depending on shaders and textures
  const isHeavy = triangleCount > 350000 || vertexCount > 400000 || (fileSizeBytes ? fileSizeBytes > 35 * 1024 * 1024 : false);

  // Smart Unit Normalization (Converts CAD/SketchUp mm/cm exports to real-world meters)
  const maxDim = Math.max(size.x, size.y, size.z, 0.001);
  let autoFitScale = 1.0;

  if (maxDim > 2000.0) {
    // Exported in millimeters (e.g., 7490 mm -> 7.49 meters)
    autoFitScale = 0.001;
  } else if (maxDim > 200.0) {
    // Exported in centimeters (e.g., 1131 cm -> 11.31 meters)
    autoFitScale = 0.01;
  } else if (maxDim < 0.3 && maxDim > 0) {
    // Tiny model (< 30cm), scale up to ~6m
    autoFitScale = 6.0 / maxDim;
  }

  const normalizedWidth = size.x * autoFitScale;
  const normalizedHeight = size.y * autoFitScale;
  const normalizedDepth = size.z * autoFitScale;
  const normalizedMaxDim = Math.max(normalizedWidth, normalizedHeight, normalizedDepth, 0.1);

  const recommendedScale = normalizedMaxDim > 0 ? 0.8 / normalizedMaxDim : 1.0;

  return {
    dimensions: {
      width: Number(normalizedWidth.toFixed(2)),
      height: Number(normalizedHeight.toFixed(2)),
      depth: Number(normalizedDepth.toFixed(2)),
    },
    originalDimensions: {
      width: Number(size.x.toFixed(2)),
      height: Number(size.y.toFixed(2)),
      depth: Number(size.z.toFixed(2)),
    },
    center: [center.x, center.y, center.z],
    vertexCount,
    triangleCount: Math.round(triangleCount),
    meshCount,
    isHeavy,
    recommendedScale,
    autoFitScale,
    fileSizeBytes,
  };
}

export function formatBytes(bytes?: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}

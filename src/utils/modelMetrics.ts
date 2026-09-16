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

  // Recommended diorama scale: fit maximum dimension within ~0.8 meters
  const maxDim = Math.max(size.x, size.y, size.z, 0.001);
  const recommendedScale = maxDim > 0 ? 0.8 / maxDim : 1.0;

  return {
    dimensions: {
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

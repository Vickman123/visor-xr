export interface Project {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  model: string;
  isLocal?: boolean;
}

export interface ModelMetrics {
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  center: [number, number, number];
  vertexCount: number;
  triangleCount: number;
  meshCount: number;
  isHeavy: boolean;
  recommendedScale: number;
  fileSizeBytes?: number;
}

export interface ModelTransform {
  position: [number, number, number];
  rotation: [number, number, number]; // Radians [x, y, z]
  scale: [number, number, number];
}

export type VRMode = 'maqueta' | 'escala1_1';
export type VRLocomotionMode = 'teleport' | 'joystick';

export interface WebXRSupportState {
  isSupported: boolean;
  isVRSupported: boolean;
  isARSupported: boolean;
  isChecking: boolean;
  error?: string;
}

export type XRSessionType = 'vr' | 'ar' | 'desktop';

import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { XR, XROrigin } from '@react-three/xr';
import * as THREE from 'three';
import { Lighting } from './Lighting';
import { FloorGrid } from './FloorGrid';
import { ModelContainer } from './ModelContainer';
import { xrStore } from '../xr/xrStore';
import { TwoHandManipulator } from '../xr/TwoHandManipulator';
import { TeleportManager } from '../xr/TeleportManager';
import { JoystickLocomotion } from '../xr/JoystickLocomotion';
import { VRFloatingMenu } from '../xr/menu/VRFloatingMenu';
import type { ModelMetrics, ModelTransform, VRLocomotionMode, VRMode } from '../../types';

interface SceneCanvasProps {
  scene: THREE.Group | null;
  metrics: ModelMetrics | null;
  transform: ModelTransform;
  onTransformChange: (updater: (prev: ModelTransform) => ModelTransform) => void;
  onResetTransform: () => void;
  onGoHome: () => void;
  frameTrigger: number;
  resetCameraTrigger: number;
}

// Inner component inside Canvas to have access to useThree()
const SceneContent: React.FC<{
  scene: THREE.Group | null;
  metrics: ModelMetrics | null;
  transform: ModelTransform;
  onTransformChange: (updater: (prev: ModelTransform) => ModelTransform) => void;
  onResetTransform: () => void;
  onGoHome: () => void;
  frameTrigger: number;
  resetCameraTrigger: number;
}> = ({
  scene,
  metrics,
  transform,
  onTransformChange,
  onResetTransform,
  onGoHome,
  frameTrigger,
  resetCameraTrigger,
}) => {
  const { camera, gl } = useThree();
  const orbitRef = useRef<OrbitControlsImpl | null>(null);
  const originRef = useRef<THREE.Group | null>(null);

  const [isVR, setIsVR] = useState(false);
  const [vrMode, setVrMode] = useState<VRMode>('maqueta');
  const [locomotionMode, setLocomotionMode] = useState<VRLocomotionMode>('teleport');

  // Monitor active WebXR session state
  useFrame(() => {
    const sessionPresenting = gl.xr.isPresenting;
    if (sessionPresenting !== isVR) {
      setIsVR(sessionPresenting);
    }
  });

  // Camera framing utility
  const frameModel = () => {
    if (!scene || !metrics) return;
    const { dimensions, center } = metrics;
    const maxDim = Math.max(dimensions.width, dimensions.height, dimensions.depth, 1);
    const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
    const cameraDist = Math.abs(maxDim / (2 * Math.tan(fov / 2))) * 1.6;

    camera.position.set(
      center[0] + cameraDist * 0.7,
      center[1] + cameraDist * 0.5,
      center[2] + cameraDist * 0.8
    );
    camera.lookAt(center[0], center[1], center[2]);

    if (orbitRef.current) {
      orbitRef.current.target.set(center[0], center[1], center[2]);
      orbitRef.current.update();
    }
  };

  // Reset Camera to standard default architectural elevation view
  const resetCamera = () => {
    if (!metrics) {
      camera.position.set(14, 10, 16);
      camera.lookAt(0, 2, 0);
      if (orbitRef.current) {
        orbitRef.current.target.set(0, 1, 0);
        orbitRef.current.update();
      }
      return;
    }
    frameModel();
  };

  // Watch for external trigger buttons from desktop toolbar
  useEffect(() => {
    if (frameTrigger > 0) {
      frameModel();
    }
  }, [frameTrigger]);

  useEffect(() => {
    if (resetCameraTrigger > 0) {
      resetCamera();
    }
  }, [resetCameraTrigger]);

  // When model loads initially, auto-frame once
  useEffect(() => {
    if (scene && metrics) {
      frameModel();
    }
  }, [scene]);

  // Handle VR mode transitions
  const handleSetVRMode = (newMode: VRMode) => {
    setVrMode(newMode);
    if (originRef.current) {
      if (newMode === 'escala1_1') {
        // Position user at ground level at front threshold of the model
        const depthOffset = metrics ? metrics.dimensions.depth * 0.55 + 2.0 : 6;
        originRef.current.position.set(0, 0, depthOffset);
        originRef.current.rotation.set(0, 0, 0);
      } else {
        // In maqueta, user stands in front of the diorama table
        originRef.current.position.set(0, 0, 0);
        originRef.current.rotation.set(0, 0, 0);
      }
    }
  };

  // Cycle scale in VR (0.5x -> 1.0x -> 2.0x)
  const handleCycleScale = () => {
    onTransformChange((prev) => {
      const current = prev.scale[0];
      let nextScale = 1.0;
      if (Math.abs(current - 1.0) < 0.1) nextScale = 2.0;
      else if (Math.abs(current - 2.0) < 0.1) nextScale = 0.5;
      else nextScale = 1.0;
      return {
        ...prev,
        scale: [nextScale, nextScale, nextScale],
      };
    });
  };

  return (
    <>
      <XR store={xrStore}>
        {/* XR Player Origin (Feet position of the user) */}
        <XROrigin ref={originRef} position={[0, 0, 0]} />

        {/* Lighting setup */}
        <Lighting enableShadows />

        {/* Floor and diorama pedestal */}
        <FloorGrid isVR={isVR} vrMode={vrMode} />

        {/* 3D Model with active transform */}
        <ModelContainer
          scene={scene}
          transform={transform}
          isVR={isVR}
          vrMode={vrMode}
          recommendedScale={metrics?.recommendedScale}
        />

        {/* VR Interactivity (Meta Quest 3S) */}
        {isVR && (
          <>
            {/* Grip & Two-Hand Manipulation */}
            <TwoHandManipulator
              vrMode={vrMode}
              transform={transform}
              onTransformChange={onTransformChange}
            />

            {/* Teleport Locomotion */}
            <TeleportManager
              vrMode={vrMode}
              locomotionMode={locomotionMode}
              originRef={originRef}
            />

            {/* Joystick Locomotion */}
            <JoystickLocomotion
              vrMode={vrMode}
              locomotionMode={locomotionMode}
              originRef={originRef}
            />

            {/* Spatial Floating Menu */}
            <VRFloatingMenu
              vrMode={vrMode}
              locomotionMode={locomotionMode}
              onSetVRMode={handleSetVRMode}
              onSetLocomotionMode={setLocomotionMode}
              onResetTransform={onResetTransform}
              onCycleScale={handleCycleScale}
              onGoHome={onGoHome}
              currentScale={transform.scale[0]}
            />
          </>
        )}
      </XR>

      {/* Desktop Orbit Controls (Active when not presenting in VR) */}
      {!isVR && (
        <OrbitControls
          ref={orbitRef}
          makeDefault
          enableDamping
          dampingFactor={0.06}
          minDistance={1.0}
          maxDistance={120}
          maxPolarAngle={Math.PI / 2 + 0.05} // Prevent camera going completely under ground
        />
      )}
    </>
  );
};

export const SceneCanvas: React.FC<SceneCanvasProps> = (props) => {
  return (
    <Canvas
      shadows
      camera={{ position: [14, 11, 16], fov: 45, near: 0.1, far: 250 }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      }}
      className="w-full h-full bg-slate-950"
    >
      <color attach="background" args={['#070a10']} />
      <fog attach="fog" args={['#070a10', 40, 180]} />
      <SceneContent {...props} />
    </Canvas>
  );
};

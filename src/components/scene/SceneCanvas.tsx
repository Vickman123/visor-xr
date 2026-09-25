import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { XR, XROrigin } from '@react-three/xr';
import * as THREE from 'three';
import { Lighting } from './Lighting';
import { FloorGrid } from './FloorGrid';
import { ModelContainer } from './ModelContainer';
import { GyroscopeCamera } from './GyroscopeCamera';
import { xrStore } from '../xr/xrStore';
import { TwoHandManipulator } from '../xr/TwoHandManipulator';
import { TeleportManager } from '../xr/TeleportManager';
import { JoystickLocomotion } from '../xr/JoystickLocomotion';
import { VRFloatingMenu } from '../xr/menu/VRFloatingMenu';
import { MuseumGallery } from './MuseumGallery';
import type { LightingPreset } from './Lighting';
import type { Project, ModelMetrics, ModelTransform, VRLocomotionMode, VRMode } from '../../types';

interface SceneCanvasProps {
  scene: THREE.Group | null;
  metrics: ModelMetrics | null;
  transform: ModelTransform;
  onTransformChange: (updater: (prev: ModelTransform) => ModelTransform) => void;
  onResetTransform: () => void;
  onGoHome: () => void;
  frameTrigger: number;
  resetCameraTrigger: number;
  onRegisterSnapshotTaker?: (taker: () => string | null) => void;
  onRegisterCanvas?: (canvas: HTMLCanvasElement | null) => void;
  projects?: Project[];
  currentProject?: Project;
  onSelectProject?: (project: Project) => void;
  lightingPreset?: LightingPreset;
  enableShadows?: boolean;
  wireframe?: boolean;
  showPedestal?: boolean;
  autoRotate?: boolean;
  theme?: 'dark' | 'light';
  isWebcamAR?: boolean;
  isGyroMode?: boolean;
  maquetaMode?: boolean;
  isMuseumMode?: boolean;
}

// Inner component inside Canvas to have access to useThree()
const SceneContent: React.FC<SceneCanvasProps> = ({
  scene,
  metrics,
  transform,
  onTransformChange,
  onResetTransform,
  onGoHome,
  frameTrigger,
  resetCameraTrigger,
  onRegisterSnapshotTaker,
  onRegisterCanvas,
  projects,
  currentProject,
  onSelectProject,
  lightingPreset = 'city',
  enableShadows = true,
  wireframe = false,
  showPedestal = true,
  autoRotate = false,
  theme = 'dark',
  isWebcamAR = false,
  isGyroMode = false,
  maquetaMode = false,
  isMuseumMode = false,
}) => {
  const { camera, gl, scene: threeScene } = useThree();
  const orbitRef = useRef<OrbitControlsImpl | null>(null);
  const originRef = useRef<THREE.Group | null>(null);
  const bgColorHex = theme === 'dark' ? '#070a10' : '#f8fafc';
  const defaultBg = useRef(new THREE.Color(bgColorHex));
  const defaultFog = useRef(new THREE.Fog(bgColorHex, 40, 180));

  useEffect(() => {
    const col = new THREE.Color(bgColorHex);
    defaultBg.current = col;
    defaultFog.current = new THREE.Fog(bgColorHex, 40, 180);
    if (threeScene && !isWebcamAR) {
      threeScene.background = col;
      threeScene.fog = defaultFog.current;
    }
  }, [theme, bgColorHex, threeScene, isWebcamAR]);

  const [isXR, setIsXR] = useState(false);
  const [isAR, setIsAR] = useState(false);
  const [vrMode, setVrMode] = useState<VRMode>('maqueta');
  const [locomotionMode, setLocomotionMode] = useState<VRLocomotionMode>('teleport');

  // Register canvas element for composite snapshots
  useEffect(() => {
    if (onRegisterCanvas && gl.domElement) {
      onRegisterCanvas(gl.domElement);
    }
  }, [onRegisterCanvas, gl]);

  // Monitor active WebXR session state and detect AR passthrough camera mode or PC webcam AR
  useFrame(() => {
    const session = gl.xr.getSession() as (XRSession & { mode?: string }) | null;
    const presenting = gl.xr.isPresenting;
    const isARMode =
      (presenting &&
        !!session &&
        (session.mode === 'immersive-ar' ||
          session.environmentBlendMode === 'alpha-blend' ||
          session.environmentBlendMode === 'additive')) ||
      isWebcamAR;

    if (presenting !== isXR || isARMode !== isAR) {
      setIsXR(presenting);
      setIsAR(isARMode);
    }

    // In AR (WebXR Passthrough or PC Webcam AR), background and fog MUST be transparent!
    if (isARMode) {
      if (threeScene.background !== null) threeScene.background = null;
      if (threeScene.fog !== null) threeScene.fog = null;
      gl.setClearColor(0x000000, 0);
    } else {
      if (threeScene.background === null) {
        threeScene.background = defaultBg.current;
      }
      if (threeScene.fog === null) {
        threeScene.fog = defaultFog.current;
      }
      gl.setClearColor(defaultBg.current, 1);
    }
  });

  // Camera framing utility
  const frameModel = () => {
    if (!scene) return;

    scene.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    const maxDim = Math.max(size.x, size.y, size.z, 1.0);
    const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
    const cameraDist = Math.abs(maxDim / (2 * Math.tan(fov / 2))) * 1.5;

    const targetY = center.y > 0 ? center.y : size.y / 2;

    camera.position.set(
      center.x + cameraDist * 0.7,
      targetY + cameraDist * 0.5,
      center.z + cameraDist * 0.8
    );
    camera.lookAt(center.x, targetY, center.z);

    if (orbitRef.current) {
      orbitRef.current.target.set(center.x, targetY, center.z);
      orbitRef.current.update();
    }
  };

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

  useEffect(() => {
    if (frameTrigger > 0) frameModel();
  }, [frameTrigger]);

  useEffect(() => {
    if (resetCameraTrigger > 0) resetCamera();
  }, [resetCameraTrigger]);

  useEffect(() => {
    if (scene && metrics) frameModel();
  }, [scene]);

  // Expose high-quality snapshot capture function
  useEffect(() => {
    if (onRegisterSnapshotTaker) {
      onRegisterSnapshotTaker(() => {
        try {
          gl.render(threeScene, camera);
          return gl.domElement.toDataURL('image/jpeg', 0.95);
        } catch (err) {
          console.error('Failed to take 3D snapshot:', err);
          return null;
        }
      });
    }
  }, [gl, threeScene, camera, onRegisterSnapshotTaker]);

  const handleSetVRMode = (newMode: VRMode) => {
    setVrMode(newMode);
    if (originRef.current) {
      if (newMode === 'escala1_1') {
        const depthOffset = metrics ? metrics.dimensions.depth * 0.55 + 2.0 : 6;
        originRef.current.position.set(0, 0, depthOffset);
        originRef.current.rotation.set(0, 0, 0);
      } else {
        originRef.current.position.set(0, 0, 0);
        originRef.current.rotation.set(0, 0, 0);
      }
    }
  };

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
        {/* XR Player Origin */}
        <XROrigin ref={originRef} position={[0, 0, 0]} />

        {/* Lighting setup */}
        <Lighting enableShadows={enableShadows && !isWebcamAR} preset={lightingPreset} />

        {/* Floor and diorama pedestal (Hidden in webcam AR or adapts to transparent shadows) */}
        {showPedestal && !isWebcamAR && !isMuseumMode && <FloorGrid isVR={isXR} isAR={isAR} vrMode={vrMode} />}

        {/* Experimental Modo Museo: Displays circular exhibition gallery with all buildings */}
        {isMuseumMode ? (
          <MuseumGallery
            projects={projects || []}
            activeModelScene={scene}
            currentProjectId={currentProject?.id}
            onSelectProject={onSelectProject}
          />
        ) : (
          /* Standard 3D Model View */
          <ModelContainer
            scene={scene}
            transform={transform}
            isVR={isXR}
            vrMode={vrMode}
            recommendedScale={metrics?.recommendedScale}
            wireframe={wireframe}
            maquetaMode={maquetaMode}
          />
        )}

        {/* XR Interactivity (Meta Quest 3S) */}
        {isXR && (
          <>
            <TwoHandManipulator
              vrMode={vrMode}
              transform={transform}
              onTransformChange={onTransformChange}
            />
            <TeleportManager
              vrMode={vrMode}
              locomotionMode={locomotionMode}
              originRef={originRef}
            />
            <JoystickLocomotion
              vrMode={vrMode}
              locomotionMode={locomotionMode}
              originRef={originRef}
            />
            <VRFloatingMenu
              vrMode={vrMode}
              locomotionMode={locomotionMode}
              isAR={isAR}
              onSetVRMode={handleSetVRMode}
              onSetLocomotionMode={setLocomotionMode}
              onResetTransform={onResetTransform}
              onCycleScale={handleCycleScale}
              onGoHome={onGoHome}
              currentScale={transform.scale[0]}
              projects={projects}
              currentProject={currentProject}
              onSelectProject={onSelectProject}
            />
          </>
        )}
      </XR>

      {/* Mobile Device Orientation / Gyroscope Camera (Dejar quieto y movernos con el móvil) */}
      {isGyroMode && !isXR && <GyroscopeCamera enabled={isGyroMode} />}

      {/* Orbit Controls (Active when NOT in VR and NOT in Gyroscope Camera mode) */}
      {!isXR && !isGyroMode && (
        <OrbitControls
          ref={orbitRef}
          makeDefault
          enableDamping
          dampingFactor={0.06}
          minDistance={0.1}
          maxDistance={50000}
          maxPolarAngle={Math.PI / 2 + 0.05}
          autoRotate={autoRotate}
          autoRotateSpeed={1.5}
          touches={{
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_PAN,
          }}
        />
      )}
    </>
  );
};

export const SceneCanvas: React.FC<SceneCanvasProps> = (props) => {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]} // Optimized DPI for ultra-smooth 60-120 FPS on mobile and PC
      camera={{ position: [14, 11, 16], fov: 45, near: 0.1, far: 50000 }}
      gl={{
        antialias: true,
        alpha: true, // Required for WebXR AR and PC Webcam AR passthrough
        preserveDrawingBuffer: true, // Required for instant high-quality snapshots
        powerPreference: 'high-performance',
      }}
      className="w-full h-full bg-transparent"
    >
      <SceneContent {...props} />
    </Canvas>
  );
};

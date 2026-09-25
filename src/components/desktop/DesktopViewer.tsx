import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import type { Project, ModelTransform, ModelMetrics } from '../../types';
import { useModelLoader } from '../../hooks/useModelLoader';
import { useWebcamAR } from '../../hooks/useWebcamAR';
import { SceneCanvas } from '../scene/SceneCanvas';
import { MetricsHUD } from './MetricsHUD';
import { WebXRButton } from './WebXRButton';
import { DesktopToolbar } from './DesktopToolbar';
import { MobileControlsHUD } from './MobileControlsHUD';
import { SnapshotModal } from './SnapshotModal';
import { MeshOptimizationModal } from '../common/MeshOptimizationModal';
import { VisualSettingsModal } from '../common/VisualSettingsModal';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorBanner } from '../common/ErrorBanner';
import type { LightingPreset } from '../scene/Lighting';
import type { ThemeMode } from '../../App';
import { Camera, RefreshCw, X, Compass } from 'lucide-react';

interface DesktopViewerProps {
  project: Project;
  localFile: File | null;
  onBackToCatalog: () => void;
  onOpenLocalFileModal: () => void;
  onUpdateThumbnail?: (projectId: string, newThumb: string) => void;
  projects?: Project[];
  onSelectProject?: (project: Project) => void;
  theme?: ThemeMode;
  onToggleTheme?: () => void;
}

const INITIAL_TRANSFORM: ModelTransform = {
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: [1.0, 1.0, 1.0],
};

export const DesktopViewer: React.FC<DesktopViewerProps> = ({
  project,
  localFile,
  onBackToCatalog,
  onOpenLocalFileModal,
  onUpdateThumbnail,
  projects,
  onSelectProject,
  theme = 'dark',
  onToggleTheme,
}) => {
  const webcam = useWebcamAR();

  // Source is either the local File object or the model path string
  const modelSource = localFile ? localFile : project.model;
  const { scene: loadedScene, metrics: loadedMetrics, isLoading, progress, error } = useModelLoader(modelSource);

  // Active scene & metrics
  const [activeScene, setActiveScene] = useState<THREE.Group | null>(null);
  const [activeMetrics, setActiveMetrics] = useState<ModelMetrics | null>(null);
  const [isOptimized, setIsOptimized] = useState<boolean>(false);

  // Architectural "Modo Maqueta" deactivated by default so original textures and colors show
  const [isMaquetaMode, setIsMaquetaMode] = useState<boolean>(false);

  // Experimental Modo Museo for displaying all models simultaneously
  const [isMuseumMode, setIsMuseumMode] = useState<boolean>(false);

  // Mobile Gyroscope / Anclar en el Espacio
  const [isGyroMode, setIsGyroMode] = useState<boolean>(false);

  const [transform, setTransform] = useState<ModelTransform>(INITIAL_TRANSFORM);
  const [frameTrigger, setFrameTrigger] = useState<number>(0);
  const [resetCameraTrigger, setResetCameraTrigger] = useState<number>(0);

  // Snapshot modal state
  const [snapshotImage, setSnapshotImage] = useState<string | null>(null);
  const [isSnapshotOpen, setIsSnapshotOpen] = useState(false);
  const snapshotTakerRef = useRef<(() => string | null) | null>(null);
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null);

  // Mesh Optimization & Visual Settings Modal states
  const [isOptimizerOpen, setIsOptimizerOpen] = useState(false);
  const [isVisualSettingsOpen, setIsVisualSettingsOpen] = useState(false);

  // Visual options - neutral preset ensures zero HDR network download and zero VRAM crash on Meta Quest
  const [lightingPreset, setLightingPreset] = useState<LightingPreset>('neutral');
  const [enableShadows, setEnableShadows] = useState<boolean>(false);
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [showPedestal, setShowPedestal] = useState<boolean>(true);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);

  // Sync loaded scene to active scene
  useEffect(() => {
    if (loadedScene && loadedMetrics) {
      setActiveScene(loadedScene);
      setActiveMetrics(loadedMetrics);
      setIsOptimized(false);
    }
  }, [loadedScene, loadedMetrics]);

  const handleResetTransform = () => {
    setTransform(INITIAL_TRANSFORM);
  };

  const handleFrameModel = () => {
    setFrameTrigger((prev) => prev + 1);
  };

  const handleResetCamera = () => {
    setResetCameraTrigger((prev) => prev + 1);
  };

  const handleTakeSnapshot = () => {
    // If in Webcam AR mode, merge webcam feed + 3D canvas
    if (webcam.isWebcamActive && canvasElementRef.current) {
      const arDataUrl = webcam.captureCompositeSnapshot(canvasElementRef.current);
      if (arDataUrl) {
        setSnapshotImage(arDataUrl);
        setIsSnapshotOpen(true);
        return;
      }
    }

    if (snapshotTakerRef.current) {
      const dataUrl = snapshotTakerRef.current();
      if (dataUrl) {
        setSnapshotImage(dataUrl);
        setIsSnapshotOpen(true);
      }
    }
  };

  const handleTakeQuickARPhoto = () => {
    if (webcam.isWebcamActive && canvasElementRef.current) {
      const arDataUrl = webcam.captureCompositeSnapshot(canvasElementRef.current);
      if (arDataUrl) {
        setSnapshotImage(arDataUrl);
        setIsSnapshotOpen(true);
      }
    }
  };

  const handleApplyOptimization = (optimizedScene: THREE.Group, newMetrics: ModelMetrics) => {
    setActiveScene(optimizedScene);
    setActiveMetrics(newMetrics);
    setIsOptimized(true);
  };

  const handleRestoreOriginal = () => {
    if (loadedScene && loadedMetrics) {
      setActiveScene(loadedScene);
      setActiveMetrics(loadedMetrics);
      setIsOptimized(false);
    }
  };

  const handleSetCover = (newThumb: string) => {
    if (onUpdateThumbnail) {
      onUpdateThumbnail(project.id, newThumb);
    }
  };

  // Toggle Gyroscope Mode (handles iOS permission if needed)
  const handleToggleGyroMode = async () => {
    if (!isGyroMode) {
      if (
        typeof window !== 'undefined' &&
        typeof (window as any).DeviceOrientationEvent !== 'undefined' &&
        typeof (window as any).DeviceOrientationEvent.requestPermission === 'function'
      ) {
        try {
          const perm = await (window as any).DeviceOrientationEvent.requestPermission();
          if (perm !== 'granted') {
            alert('Se requiere permiso para usar el giroscopio del móvil.');
            return;
          }
        } catch (e) {
          console.warn('iOS orientation permission error:', e);
        }
      }
      setIsGyroMode(true);
    } else {
      setIsGyroMode(false);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none">
      {/* Live Video Element for PC/Mobile Webcam AR Passthrough */}
      <video
        ref={webcam.videoRef}
        autoPlay
        playsInline
        muted
        className={`fixed inset-0 w-full h-full object-cover z-0 pointer-events-none transition-opacity duration-300 ${
          webcam.isWebcamActive ? 'opacity-100' : 'opacity-0 hidden'
        }`}
      />

      {/* Top Bar with Project HUD and WebXR Action Button */}
      <MetricsHUD project={project} metrics={activeMetrics} />

      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <WebXRButton />
      </div>

      {/* Webcam AR Mode Top Banner & Camera HUD */}
      {webcam.isWebcamActive && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-slate-900/90 backdrop-blur-xl border border-emerald-400/50 px-4 py-2 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-emerald-300">
              Cámara AR Activa
            </span>
          </div>

          <div className="w-px h-4 bg-white/20 mx-1" />

          {/* Quick AR Snapshot */}
          <button
            onClick={handleTakeQuickARPhoto}
            className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-3 py-1 rounded-xl transition-all active:scale-95 cursor-pointer shadow-md"
            title="Tomar foto con el modelo en la cámara"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Foto AR</span>
          </button>

          {/* Switch Camera if multiple cameras exist */}
          {webcam.hasMultipleCameras && (
            <button
              onClick={() => webcam.switchCamera()}
              className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-2.5 py-1 rounded-xl transition-all active:scale-95 cursor-pointer"
              title="Cambiar entre cámara frontal y trasera"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Girar</span>
            </button>
          )}

          {/* Close AR */}
          <button
            onClick={() => webcam.stopWebcam()}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Desactivar modo AR"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Gyroscope Mode Active Indicator */}
      {isGyroMode && (
        <div className="absolute top-16 left-4 z-20 flex items-center gap-2 bg-slate-900/90 backdrop-blur-xl border border-cyan-400/40 px-3 py-1.5 rounded-2xl shadow-xl">
          <Compass className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="text-[11px] font-semibold text-cyan-200">
            Giroscopio Activo • Mueve el móvil
          </span>
          <button
            onClick={() => setIsGyroMode(false)}
            className="text-slate-400 hover:text-white ml-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3D Scene Viewport */}
      <SceneCanvas
        scene={activeScene}
        metrics={activeMetrics}
        transform={transform}
        onTransformChange={setTransform}
        onResetTransform={handleResetTransform}
        onGoHome={onBackToCatalog}
        frameTrigger={frameTrigger}
        resetCameraTrigger={resetCameraTrigger}
        onRegisterSnapshotTaker={(taker) => {
          snapshotTakerRef.current = taker;
        }}
        onRegisterCanvas={(canvas) => {
          canvasElementRef.current = canvas;
        }}
        projects={projects}
        currentProject={project}
        onSelectProject={onSelectProject}
        lightingPreset={lightingPreset}
        enableShadows={enableShadows}
        wireframe={wireframe}
        showPedestal={showPedestal}
        autoRotate={autoRotate}
        theme={theme}
        isWebcamAR={webcam.isWebcamActive}
        isGyroMode={isGyroMode}
        maquetaMode={isMaquetaMode}
        isMuseumMode={isMuseumMode}
      />

      {/* Interactive Bottom Toolbar for Desktop Controls */}
      <DesktopToolbar
        onBackToCatalog={onBackToCatalog}
        onResetCamera={handleResetCamera}
        onFrameModel={handleFrameModel}
        onResetTransform={handleResetTransform}
        onOpenLocalFile={onOpenLocalFileModal}
        onTakeSnapshot={handleTakeSnapshot}
        onOpenOptimizer={() => setIsOptimizerOpen(true)}
        onOpenVisualSettings={() => setIsVisualSettingsOpen(true)}
        transform={transform}
        onTransformChange={setTransform}
        isOptimized={isOptimized}
        metrics={activeMetrics}
        theme={theme}
        onToggleTheme={onToggleTheme}
        isWebcamAR={webcam.isWebcamActive}
        onToggleWebcamAR={() => webcam.toggleWebcam()}
        isMaquetaMode={isMaquetaMode}
        onToggleMaquetaMode={() => setIsMaquetaMode(!isMaquetaMode)}
        projects={projects}
        currentProject={project}
        onSelectProject={onSelectProject}
        isMuseumMode={isMuseumMode}
        onToggleMuseumMode={() => setIsMuseumMode(!isMuseumMode)}
      />

      {/* Mobile Floating Touch Controls (Zoom, Move, Gyro, AR, Switcher) */}
      <MobileControlsHUD
        transform={transform}
        onTransformChange={setTransform}
        onFrameModel={handleFrameModel}
        isGyroMode={isGyroMode}
        onToggleGyroMode={handleToggleGyroMode}
        isWebcamAR={webcam.isWebcamActive}
        onToggleWebcamAR={() => webcam.toggleWebcam()}
        isMaquetaMode={isMaquetaMode}
        onToggleMaquetaMode={() => setIsMaquetaMode(!isMaquetaMode)}
        projects={projects}
        currentProject={project}
        onSelectProject={onSelectProject}
      />

      {/* Loading State Overlay */}
      {isLoading && <LoadingSpinner progress={progress} />}

      {/* Error Fallback Banner */}
      {error && <ErrorBanner message={error} onBack={onBackToCatalog} />}

      {/* Real-time Snapshot / Photo Modal */}
      <SnapshotModal
        isOpen={isSnapshotOpen}
        imageSrc={snapshotImage}
        project={project}
        onClose={() => setIsSnapshotOpen(false)}
        onSetAsCover={handleSetCover}
      />

      {/* Mesh Optimization Decimation Algorithm Modal */}
      <MeshOptimizationModal
        isOpen={isOptimizerOpen}
        onClose={() => setIsOptimizerOpen(false)}
        originalScene={loadedScene}
        metrics={loadedMetrics}
        onApplyOptimization={handleApplyOptimization}
        onRestoreOriginal={handleRestoreOriginal}
        isOptimized={isOptimized}
      />

      {/* HD Visual Settings & Lighting Controls Modal */}
      <VisualSettingsModal
        isOpen={isVisualSettingsOpen}
        onClose={() => setIsVisualSettingsOpen(false)}
        lightingPreset={lightingPreset}
        onLightingPresetChange={setLightingPreset}
        enableShadows={enableShadows}
        onToggleShadows={() => setEnableShadows(!enableShadows)}
        wireframe={wireframe}
        onToggleWireframe={() => setWireframe(!wireframe)}
        showPedestal={showPedestal}
        onTogglePedestal={() => setShowPedestal(!showPedestal)}
        autoRotate={autoRotate}
        onToggleAutoRotate={() => setAutoRotate(!autoRotate)}
      />
    </div>
  );
};

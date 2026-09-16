import React, { useState } from 'react';
import type { Project, ModelTransform } from '../../types';
import { useModelLoader } from '../../hooks/useModelLoader';
import { SceneCanvas } from '../scene/SceneCanvas';
import { MetricsHUD } from './MetricsHUD';
import { WebXRButton } from './WebXRButton';
import { DesktopToolbar } from './DesktopToolbar';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorBanner } from '../common/ErrorBanner';

interface DesktopViewerProps {
  project: Project;
  localFile: File | null;
  onBackToCatalog: () => void;
  onOpenLocalFileModal: () => void;
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
}) => {
  // Source is either the local File object or the model path string
  const modelSource = localFile ? localFile : project.model;
  const { scene, metrics, isLoading, progress, error } = useModelLoader(modelSource);

  const [transform, setTransform] = useState<ModelTransform>(INITIAL_TRANSFORM);
  const [frameTrigger, setFrameTrigger] = useState<number>(0);
  const [resetCameraTrigger, setResetCameraTrigger] = useState<number>(0);

  const handleResetTransform = () => {
    setTransform(INITIAL_TRANSFORM);
  };

  const handleFrameModel = () => {
    setFrameTrigger((prev) => prev + 1);
  };

  const handleResetCamera = () => {
    setResetCameraTrigger((prev) => prev + 1);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none">
      {/* Top Bar with Project HUD and WebXR Action Button */}
      <MetricsHUD project={project} metrics={metrics} />

      <div className="absolute top-4 right-4 z-20">
        <WebXRButton />
      </div>

      {/* 3D Scene Viewport */}
      <SceneCanvas
        scene={scene}
        metrics={metrics}
        transform={transform}
        onTransformChange={setTransform}
        onResetTransform={handleResetTransform}
        onGoHome={onBackToCatalog}
        frameTrigger={frameTrigger}
        resetCameraTrigger={resetCameraTrigger}
      />

      {/* Interactive Bottom Toolbar for Desktop Controls */}
      <DesktopToolbar
        onBackToCatalog={onBackToCatalog}
        onResetCamera={handleResetCamera}
        onFrameModel={handleFrameModel}
        onResetTransform={handleResetTransform}
        onOpenLocalFile={onOpenLocalFileModal}
        transform={transform}
        onTransformChange={setTransform}
      />

      {/* Loading State Overlay */}
      {isLoading && <LoadingSpinner progress={progress} />}

      {/* Error Fallback Banner */}
      {error && <ErrorBanner message={error} onBack={onBackToCatalog} />}
    </div>
  );
};

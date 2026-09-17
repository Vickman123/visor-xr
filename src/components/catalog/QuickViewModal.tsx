import React, { useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import type { Project } from '../../types';
import { useModelLoader } from '../../hooks/useModelLoader';
import { Lighting } from '../scene/Lighting';
import { ModelContainer } from '../scene/ModelContainer';
import { X, Camera, Glasses, ArrowRight, Check, Box, Maximize2 } from 'lucide-react';

interface QuickViewModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenFullViewer: (project: Project) => void;
  onEnterAR: (project: Project) => void;
  onEnterVR: (project: Project) => void;
  onUpdateThumbnail?: (projectId: string, newThumb: string) => void;
}

// Inner canvas content that can access Three.js context and snapshot
const QuickViewContent: React.FC<{
  scene: any;
  metrics: any;
  onRegisterSnapshot: (fn: () => string | null) => void;
}> = ({ scene, metrics, onRegisterSnapshot }) => {
  const { gl, camera, scene: threeScene } = useThree();

  React.useEffect(() => {
    onRegisterSnapshot(() => {
      try {
        gl.render(threeScene, camera);
        return gl.domElement.toDataURL('image/jpeg', 0.95);
      } catch (e) {
        console.error('Snapshot error:', e);
        return null;
      }
    });
  }, [gl, camera, threeScene, onRegisterSnapshot]);

  return (
    <>
      <Lighting enableShadows={false} />
      <Grid
        position={[0, -0.01, 0]}
        args={[40, 40]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#334155"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#64748b"
        fadeDistance={25}
        fadeStrength={1.2}
      />
      <ModelContainer
        scene={scene}
        transform={{ position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] }}
        isVR={false}
        vrMode="maqueta"
        recommendedScale={metrics?.recommendedScale}
      />
      <OrbitControls
        makeDefault
        autoRotate
        autoRotateSpeed={0.8}
        enableDamping
        dampingFactor={0.06}
        minDistance={1.5}
        maxDistance={50}
        maxPolarAngle={Math.PI / 2 + 0.05}
      />
    </>
  );
};

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  project,
  isOpen,
  onClose,
  onOpenFullViewer,
  onEnterAR,
  onEnterVR,
  onUpdateThumbnail,
}) => {
  const snapshotFnRef = useRef<(() => string | null) | null>(null);
  const [photoTakenFeedback, setPhotoTakenFeedback] = useState(false);

  if (!isOpen || !project) return null;

  const { scene, metrics, isLoading, error } = useModelLoader(project.model);

  const handleTakeSnapshot = () => {
    if (snapshotFnRef.current) {
      const dataUrl = snapshotFnRef.current();
      if (dataUrl) {
        try {
          localStorage.setItem(`custom_thumb_${project.id}`, dataUrl);
          if (onUpdateThumbnail) {
            onUpdateThumbnail(project.id, dataUrl);
          }
          setPhotoTakenFeedback(true);
          setTimeout(() => setPhotoTakenFeedback(false), 3000);
        } catch (e) {
          console.warn('Error saving snapshot to localStorage:', e);
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  {project.name}
                </h3>
                {project.category && (
                  <span className="text-[10px] uppercase font-semibold tracking-wider bg-slate-800 text-cyan-300 px-2 py-0.5 rounded-full border border-slate-700">
                    {project.category}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 line-clamp-1">
                Vista rápida 3D interactiva 360°
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3D Viewport */}
        <div className="relative w-full h-80 sm:h-96 bg-slate-950 flex items-center justify-center overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center gap-2 text-xs text-slate-400">
              <span className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <span>Cargando geometría 3D...</span>
            </div>
          ) : error ? (
            <div className="text-xs text-red-400 px-4 text-center">
              {error}
            </div>
          ) : (
            <Canvas
              shadows={false}
              camera={{ position: [8, 6, 9], fov: 40, near: 0.1, far: 200 }}
              gl={{ antialias: true, preserveDrawingBuffer: true }}
              className="w-full h-full cursor-grab active:cursor-grabbing"
            >
              <QuickViewContent
                scene={scene}
                metrics={metrics}
                onRegisterSnapshot={(fn) => {
                  snapshotFnRef.current = fn;
                }}
              />
            </Canvas>
          )}

          {/* Toast feedback when photo is taken */}
          {photoTakenFeedback && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-emerald-950/90 border border-emerald-700 text-emerald-300 text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>¡Foto capturada! Guardada como portada del proyecto.</span>
            </div>
          )}

          {/* Quick Snapshot Action Overlaid on Top Right of Viewport */}
          <div className="absolute bottom-3 right-3 z-10">
            <button
              onClick={handleTakeSnapshot}
              className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md transition-all shadow-lg active:scale-95 cursor-pointer"
              title="Tomar captura de esta vista 3D y usarla como portada"
            >
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span>Capturar Foto</span>
            </button>
          </div>

          <div className="absolute bottom-3 left-3 text-[11px] text-slate-400/80 bg-slate-900/70 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-800 pointer-events-none">
            Gira con el ratón o táctil • Auto-rotación activa
          </div>
        </div>

        {/* Info & Metrics Strip */}
        <div className="px-6 py-3 bg-slate-900/60 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-4">
            {metrics && (
              <>
                <div>
                  <span className="text-slate-400">Dimensiones: </span>
                  <span className="font-mono text-cyan-300">
                    {metrics.dimensions.width.toFixed(1)}m × {metrics.dimensions.height.toFixed(1)}m × {metrics.dimensions.depth.toFixed(1)}m
                  </span>
                </div>
                <div className="hidden sm:block">
                  <span className="text-slate-400">Polígonos: </span>
                  <span className="font-mono text-cyan-300">
                    {(metrics.triangleCount / 1000).toFixed(0)}k tris
                  </span>
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenFullViewer(project);
            }}
            className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
          >
            <span>Abrir en Visor Completo</span>
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEnterAR(project);
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-95 text-white px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer shadow-lg shadow-emerald-500/25"
            >
              <Camera className="w-4 h-4" />
              <span>👓 Entrar en AR</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onEnterVR(project);
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 text-white px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer shadow-lg shadow-cyan-500/25"
            >
              <Glasses className="w-4 h-4" />
              <span>🥽 Entrar en VR</span>
            </button>
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenFullViewer(project);
            }}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
          >
            <span>Ver en 3D (PC)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Move,
  Maximize,
  Compass,
  Camera,
  ChevronDown,
  Box,
} from 'lucide-react';
import type { ModelTransform, Project } from '../../types';

interface MobileControlsHUDProps {
  transform: ModelTransform;
  onTransformChange: (updater: (prev: ModelTransform) => ModelTransform) => void;
  onFrameModel: () => void;
  isGyroMode: boolean;
  onToggleGyroMode: () => void;
  isWebcamAR: boolean;
  onToggleWebcamAR: () => void;
  isMaquetaMode: boolean;
  onToggleMaquetaMode: () => void;
  projects?: Project[];
  currentProject?: Project;
  onSelectProject?: (project: Project) => void;
}

export const MobileControlsHUD: React.FC<MobileControlsHUDProps> = ({
  transform,
  onTransformChange,
  onFrameModel,
  isGyroMode,
  onToggleGyroMode,
  isWebcamAR,
  onToggleWebcamAR,
  isMaquetaMode,
  onToggleMaquetaMode,
  projects = [],
  currentProject,
  onSelectProject,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'transform' | 'modes'>('transform');

  // Switch to previous project on mobile
  const handlePrevProject = () => {
    if (!projects.length || !onSelectProject) return;
    const currentIndex = currentProject ? projects.findIndex((p) => p.id === currentProject.id) : 0;
    const prevIndex = (currentIndex - 1 + projects.length) % projects.length;
    onSelectProject(projects[prevIndex]);
  };

  // Switch to next project on mobile
  const handleNextProject = () => {
    if (!projects.length || !onSelectProject) return;
    const currentIndex = currentProject ? projects.findIndex((p) => p.id === currentProject.id) : 0;
    const nextIndex = (currentIndex + 1) % projects.length;
    onSelectProject(projects[nextIndex]);
  };

  // Zoom controls
  const handleZoom = (factor: number) => {
    onTransformChange((prev) => {
      const nextScale = Math.max(0.1, Math.min(8.0, prev.scale[0] * factor));
      return {
        ...prev,
        scale: [nextScale, nextScale, nextScale],
      };
    });
  };

  // Move controls (X, Y, Z)
  const handleMove = (dx: number, dy: number, dz: number) => {
    onTransformChange((prev) => ({
      ...prev,
      position: [
        prev.position[0] + dx,
        prev.position[1] + dy,
        prev.position[2] + dz,
      ],
    }));
  };

  // Rotate controls
  const handleRotate = (deg: number) => {
    onTransformChange((prev) => {
      const rad = (deg * Math.PI) / 180;
      return {
        ...prev,
        rotation: [prev.rotation[0], prev.rotation[1] + rad, prev.rotation[2]],
      };
    });
  };

  return (
    <div className="fixed bottom-20 right-3 z-30 flex flex-col items-end gap-2 pointer-events-auto select-none sm:hidden">
      {/* Toggle Open/Close Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-slate-900/90 text-cyan-400 border border-cyan-500/40 flex items-center justify-center shadow-2xl backdrop-blur-md active:scale-90 transition-transform"
        title="Controles táctiles móviles"
      >
        {isOpen ? <ChevronDown className="w-5 h-5" /> : <Move className="w-5 h-5" />}
      </button>

      {isOpen && (
        <div className="w-64 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-3 shadow-2xl flex flex-col gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Header Tabs */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-[11px] font-bold tracking-wider text-cyan-400 uppercase">
              Controles Táctiles
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab('transform')}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-colors ${
                  activeTab === 'transform'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Mover / Zoom
              </button>
              <button
                onClick={() => setActiveTab('modes')}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-colors ${
                  activeTab === 'modes'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Modos
              </button>
            </div>
          </div>

          {/* Quick Model Switcher for Mobile */}
          {projects && projects.length > 1 && onSelectProject && (
            <div className="flex items-center justify-between bg-slate-950/80 px-2 py-1.5 rounded-2xl border border-cyan-500/30">
              <button
                onClick={handlePrevProject}
                className="w-7 h-7 rounded-lg bg-slate-850 hover:bg-slate-800 text-cyan-300 flex items-center justify-center text-xs font-bold active:scale-90 cursor-pointer"
                title="Modelo anterior"
              >
                ◀
              </button>
              <div className="flex flex-col items-center max-w-[130px] truncate text-center">
                <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider">
                  Modelo {currentProject ? projects.findIndex((p) => p.id === currentProject.id) + 1 : 1}/{projects.length}
                </span>
                <span className="text-[11px] font-semibold text-white truncate max-w-full">
                  {currentProject?.name || 'Modelo 3D'}
                </span>
              </div>
              <button
                onClick={handleNextProject}
                className="w-7 h-7 rounded-lg bg-slate-850 hover:bg-slate-800 text-cyan-300 flex items-center justify-center text-xs font-bold active:scale-90 cursor-pointer"
                title="Siguiente modelo"
              >
                ▶
              </button>
            </div>
          )}

          {activeTab === 'transform' ? (
            <div className="flex flex-col gap-2">
              {/* Zoom In / Zoom Out */}
              <div className="flex items-center justify-between bg-slate-950/60 p-2 rounded-2xl border border-white/5">
                <span className="text-[11px] font-medium text-slate-300">Zoom / Escala</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleZoom(0.85)}
                    className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center active:scale-90 transition-transform"
                    title="Alejar modelo"
                  >
                    <ZoomOut className="w-4 h-4 text-cyan-400" />
                  </button>
                  <span className="text-[10px] font-mono text-cyan-300 w-9 text-center">
                    {transform.scale[0].toFixed(1)}x
                  </span>
                  <button
                    onClick={() => handleZoom(1.15)}
                    className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center active:scale-90 transition-transform"
                    title="Acercar modelo"
                  >
                    <ZoomIn className="w-4 h-4 text-cyan-400" />
                  </button>
                </div>
              </div>

              {/* D-Pad / Move Pad */}
              <div className="flex flex-col items-center bg-slate-950/60 p-2 rounded-2xl border border-white/5">
                <span className="text-[10px] font-medium text-slate-400 mb-1">Mover Maqueta</span>
                <div className="grid grid-cols-3 gap-1 w-full max-w-[150px]">
                  <div />
                  <button
                    onClick={() => handleMove(0, 0, -0.5)}
                    className="h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center text-xs font-bold active:scale-90"
                    title="Mover adelante"
                  >
                    ▲
                  </button>
                  <div />
                  <button
                    onClick={() => handleMove(-0.5, 0, 0)}
                    className="h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center text-xs font-bold active:scale-90"
                    title="Mover izquierda"
                  >
                    ◀
                  </button>
                  <button
                    onClick={onFrameModel}
                    className="h-8 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 flex items-center justify-center text-[10px] font-bold active:scale-90"
                    title="Centrar"
                  >
                    <Maximize className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMove(0.5, 0, 0)}
                    className="h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center text-xs font-bold active:scale-90"
                    title="Mover derecha"
                  >
                    ▶
                  </button>
                  <div />
                  <button
                    onClick={() => handleMove(0, 0, 0.5)}
                    className="h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center text-xs font-bold active:scale-90"
                    title="Mover atrás"
                  >
                    ▼
                  </button>
                  <div />
                </div>

                {/* Elevation & Rotate Row */}
                <div className="flex items-center justify-between w-full mt-2 pt-2 border-t border-white/5">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMove(0, 0.3, 0)}
                      className="px-2 py-1 rounded-lg bg-slate-800 text-[10px] text-slate-300 font-semibold active:scale-90"
                    >
                      Subir Y+
                    </button>
                    <button
                      onClick={() => handleMove(0, -0.3, 0)}
                      className="px-2 py-1 rounded-lg bg-slate-800 text-[10px] text-slate-300 font-semibold active:scale-90"
                    >
                      Bajar Y-
                    </button>
                  </div>
                  <button
                    onClick={() => handleRotate(45)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-cyan-300 text-[10px] font-semibold active:scale-90"
                    title="Rotar 45 grados"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>Rotar 45°</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {/* Gyroscope / Lock in place & move around with mobile */}
              <button
                onClick={onToggleGyroMode}
                className={`w-full p-2.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  isGyroMode
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 shadow-lg'
                    : 'bg-slate-950/60 border-white/10 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-400" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold">
                      {isGyroMode ? 'Modo Anclado Activo' : 'Dejar Quieto y Moverse'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Giroscopio móvil 360°
                    </span>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isGyroMode ? 'bg-emerald-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}>
                  {isGyroMode ? 'ON' : 'OFF'}
                </span>
              </button>

              {/* Mobile Webcam AR */}
              <button
                onClick={onToggleWebcamAR}
                className={`w-full p-2.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  isWebcamAR
                    ? 'bg-teal-500/20 border-teal-400 text-teal-200 shadow-lg'
                    : 'bg-slate-950/60 border-white/10 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-teal-400" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold">
                      {isWebcamAR ? 'Cámara AR Activa' : 'Activar Cámara AR'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Ver modelo en tu entorno real
                    </span>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isWebcamAR ? 'bg-teal-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}>
                  {isWebcamAR ? 'ON' : 'OFF'}
                </span>
              </button>

              {/* Modo Maqueta Architectural Clay */}
              <button
                onClick={onToggleMaquetaMode}
                className={`w-full p-2.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  isMaquetaMode
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-lg'
                    : 'bg-slate-950/60 border-white/10 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Box className="w-4 h-4 text-cyan-400" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold">Modo Maqueta Blanca</span>
                    <span className="text-[10px] text-slate-400">
                      60-120 FPS sin lag
                    </span>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isMaquetaMode ? 'bg-cyan-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}>
                  {isMaquetaMode ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

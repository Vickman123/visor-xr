import React, { useState } from 'react';
import type { ModelTransform, ModelMetrics, Project } from '../../types';
import {
  RotateCcw,
  Sliders,
  Home,
  FolderOpen,
  ChevronUp,
  ChevronDown,
  Camera,
  Box,
  Ruler,
  Zap,
  Sun,
  Moon,
  Video,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
} from 'lucide-react';
import type { ThemeMode } from '../../App';

interface DesktopToolbarProps {
  onBackToCatalog: () => void;
  onResetCamera: () => void;
  onFrameModel?: () => void;
  onResetTransform: () => void;
  onOpenLocalFile: () => void;
  onTakeSnapshot?: () => void;
  onOpenOptimizer?: () => void;
  onOpenVisualSettings?: () => void;
  transform: ModelTransform;
  onTransformChange: (updater: (prev: ModelTransform) => ModelTransform) => void;
  isOptimized?: boolean;
  metrics?: ModelMetrics | null;
  theme?: ThemeMode;
  onToggleTheme?: () => void;
  isWebcamAR?: boolean;
  onToggleWebcamAR?: () => void;
  isMaquetaMode?: boolean;
  onToggleMaquetaMode?: () => void;
  projects?: Project[];
  currentProject?: Project;
  onSelectProject?: (project: Project) => void;
  isMuseumMode?: boolean;
  onToggleMuseumMode?: () => void;
  isMetaQuest?: boolean;
}

export const DesktopToolbar: React.FC<DesktopToolbarProps> = ({
  onBackToCatalog,
  onResetCamera,
  onFrameModel: _onFrameModel,
  onResetTransform,
  onOpenLocalFile,
  onTakeSnapshot,
  onOpenOptimizer,
  onOpenVisualSettings: _onOpenVisualSettings,
  transform,
  onTransformChange,
  isOptimized = false,
  metrics,
  theme = 'dark',
  onToggleTheme,
  isWebcamAR = false,
  onToggleWebcamAR,
  isMaquetaMode = false,
  onToggleMaquetaMode,
  projects = [],
  currentProject,
  onSelectProject,
  isMuseumMode = false,
  onToggleMuseumMode,
  isMetaQuest: _isMetaQuest = false,
}) => {
  const [showTransformPanel, setShowTransformPanel] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const autoFitScale = metrics?.autoFitScale ?? 1.0;

  const handleSetDioramaScale = () => {
    onTransformChange((prev) => ({
      ...prev,
      scale: [1.0, 1.0, 1.0],
    }));
  };

  const handleSetRealScale = () => {
    const realFactor = autoFitScale > 0 ? 1.0 / autoFitScale : 1.0;
    onTransformChange((prev) => ({
      ...prev,
      scale: [realFactor, realFactor, realFactor],
    }));
  };

  // Switch to previous project
  const handlePrevProject = () => {
    if (!projects.length || !onSelectProject) return;
    const currentIndex = currentProject ? projects.findIndex((p) => p.id === currentProject.id) : 0;
    const prevIndex = (currentIndex - 1 + projects.length) % projects.length;
    onSelectProject(projects[prevIndex]);
  };

  // Switch to next project
  const handleNextProject = () => {
    if (!projects.length || !onSelectProject) return;
    const currentIndex = currentProject ? projects.findIndex((p) => p.id === currentProject.id) : 0;
    const nextIndex = (currentIndex + 1) % projects.length;
    onSelectProject(projects[nextIndex]);
  };

  const currentProjectName = currentProject?.name || 'Modelo 3D';
  const currentIndex = currentProject ? projects.findIndex((p) => p.id === currentProject.id) : -1;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3 max-w-[98vw] w-max px-2">
      {/* Project Quick Switcher Popover */}
      {showProjectDropdown && projects.length > 0 && onSelectProject && (
        <div className="bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-2.5 shadow-2xl w-80 max-h-80 overflow-y-auto flex flex-col gap-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1">
            Seleccionar Modelo ({projects.length})
          </span>
          {projects.map((p, idx) => {
            const isSelected = p.id === currentProject?.id;
            return (
              <button
                key={p.id}
                onClick={() => {
                  onSelectProject(p);
                  setShowProjectDropdown(false);
                }}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-[10px] text-slate-500 font-mono w-4">{idx + 1}.</span>
                  <span className="truncate">{p.name}</span>
                </div>
                {isSelected && <span className="text-cyan-400 text-xs">✓</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* Expanded Transform Manipulation Drawer */}
      {showTransformPanel && (
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 shadow-2xl w-80 text-xs text-slate-200 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-semibold text-cyan-400 uppercase tracking-wider">
              Escala y Posición
            </span>
            <button
              onClick={onResetTransform}
              className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
            >
              Resetear
            </button>
          </div>

          {/* Scale Mode Presets */}
          <div className="grid grid-cols-2 gap-2 pb-1 border-b border-slate-800/80">
            <button
              onClick={handleSetDioramaScale}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Escalar a tamaño maqueta (~6m) perfectamente visible"
            >
              <Box className="w-3.5 h-3.5 text-sky-400" />
              <span>Tamaño Maqueta</span>
            </button>
            <button
              onClick={handleSetRealScale}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Escalar a tamaño real 1:1 (dimensiones originales de arquitectura)"
            >
              <Ruler className="w-3.5 h-3.5 text-amber-400" />
              <span>Escala Real 1:1</span>
            </button>
          </div>

          {/* Scale Slider */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Escala:</span>
              <span className="font-mono text-cyan-300">
                {transform.scale[0].toFixed(2)}x
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.05"
              value={transform.scale[0]}
              onChange={(e) => {
                const s = parseFloat(e.target.value);
                onTransformChange((prev) => ({
                  ...prev,
                  scale: [s, s, s],
                }));
              }}
              className="accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Rotation Y Slider */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Rotación (Eje Y):</span>
              <span className="font-mono text-cyan-300">
                {Math.round((transform.rotation[1] * 180) / Math.PI)}°
              </span>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              step="5"
              value={Math.round((transform.rotation[1] * 180) / Math.PI)}
              onChange={(e) => {
                const deg = parseFloat(e.target.value);
                const rad = (deg * Math.PI) / 180;
                onTransformChange((prev) => ({
                  ...prev,
                  rotation: [prev.rotation[0], rad, prev.rotation[2]],
                }));
              }}
              className="accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Height (Y Position) Slider */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Elevación (Y):</span>
              <span className="font-mono text-cyan-300">
                {transform.position[1].toFixed(2)}m
              </span>
            </div>
            <input
              type="range"
              min="-2"
              max="5"
              step="0.1"
              value={transform.position[1]}
              onChange={(e) => {
                const y = parseFloat(e.target.value);
                onTransformChange((prev) => ({
                  ...prev,
                  position: [prev.position[0], y, prev.position[2]],
                }));
              }}
              className="accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Main Glassmorphism Bar - Expanded for PC and zero truncation */}
      <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-900/90 backdrop-blur-2xl border border-slate-700/80 p-2 sm:p-2.5 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.6)] overflow-x-auto max-w-full no-scrollbar shrink-0">
        {/* Back to Catalog */}
        <button
          onClick={onBackToCatalog}
          className="flex items-center gap-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800/80 px-3 py-2 rounded-xl transition-all cursor-pointer shrink-0"
          title="Regresar a biblioteca de proyectos"
        >
          <Home className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Biblioteca</span>
        </button>

        <div className="w-px h-5 bg-slate-800 my-auto shrink-0" />

        {/* Previous Model Button */}
        {projects.length > 1 && onSelectProject && (
          <button
            onClick={handlePrevProject}
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all active:scale-90 cursor-pointer shrink-0"
            title="Cambiar al modelo anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Model Selector Dropdown Button */}
        {projects.length > 1 && onSelectProject && (
          <button
            onClick={() => setShowProjectDropdown(!showProjectDropdown)}
            className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700/90 text-slate-200 hover:text-white px-3 py-2 rounded-xl text-xs font-semibold max-w-[170px] sm:max-w-[260px] lg:max-w-[340px] truncate transition-all cursor-pointer shrink-0"
            title="Cambiar entre los modelos disponibles"
          >
            <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="truncate">
              {currentIndex >= 0 ? `[${currentIndex + 1}/${projects.length}] ` : ''}
              {currentProjectName}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </button>
        )}

        {/* Next Model Button */}
        {projects.length > 1 && onSelectProject && (
          <button
            onClick={handleNextProject}
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all active:scale-90 cursor-pointer shrink-0"
            title="Cambiar al modelo siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        <div className="w-px h-5 bg-slate-800 my-auto shrink-0" />

        {/* Experimental Modo Museo Button (Meta Quest / XR) */}
        {onToggleMuseumMode && (
          <button
            onClick={onToggleMuseumMode}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
              isMuseumMode
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] border border-purple-400/50'
                : 'text-purple-300 hover:text-white hover:bg-purple-950/40 border border-purple-500/20'
            }`}
            title="Modo Museo (Experimental): Exhibe todas las maquetas simultáneamente en una galería espacial 3D"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span>{isMuseumMode ? '🏛️ Museo ON' : '🏛️ Modo Museo (Exp)'}</span>
          </button>
        )}

        {/* Modo Maqueta Architectural Clay Toggle */}
        {onToggleMaquetaMode && (
          <button
            onClick={onToggleMaquetaMode}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
              isMaquetaMode
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
            title="Modo Maqueta: Textura arquitectónica blanca uniforme para máxima fluidez a 60-120 FPS"
          >
            <Box className="w-4 h-4 text-cyan-300 shrink-0" />
            <span>{isMaquetaMode ? 'Maqueta ON' : 'Modo Maqueta'}</span>
          </button>
        )}

        {/* PC / Mobile Webcam AR Mode Toggle */}
        {onToggleWebcamAR && (
          <button
            onClick={onToggleWebcamAR}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
              isWebcamAR
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)] border border-emerald-400/50'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
            title="Activar cámara web para versión AR (Realidad Aumentada en PC o Móvil)"
          >
            <Video className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{isWebcamAR ? 'AR Activa' : 'AR Cámara'}</span>
          </button>
        )}

        <div className="w-px h-5 bg-slate-800 my-auto shrink-0" />

        {/* Reset Camera */}
        <button
          onClick={onResetCamera}
          className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 px-3 py-2 rounded-xl transition-all cursor-pointer shrink-0"
          title="Restablecer posición de cámara"
        >
          <RotateCcw className="w-4 h-4 text-slate-400 shrink-0" />
          <span>Reset</span>
        </button>

        {/* Capture Snapshot */}
        {onTakeSnapshot && (
          <button
            onClick={onTakeSnapshot}
            className="flex items-center gap-2 text-xs font-bold text-white bg-gradient-to-r from-amber-500/90 to-amber-600/90 hover:from-amber-400 hover:to-amber-500 active:scale-95 px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-sm shadow-amber-500/20 shrink-0"
            title="Tomar foto / captura realista del modelo y guardarla como portada"
          >
            <Camera className="w-4 h-4 shrink-0" />
            <span>Capturar</span>
          </button>
        )}

        {/* Transform Tools */}
        <button
          onClick={() => setShowTransformPanel(!showTransformPanel)}
          className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
            showTransformPanel
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
          }`}
          title="Herramientas de mover, rotar y escalar"
        >
          <Sliders className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Mover</span>
          {showTransformPanel ? (
            <ChevronDown className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          )}
        </button>

        {/* Mesh Optimizer Modal (Internal Algorithm) */}
        {onOpenOptimizer && (
          <button
            onClick={onOpenOptimizer}
            className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
              isOptimized
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-sm shadow-sky-500/20'
            }`}
            title="Algoritmo interno para optimizar y reducir polígonos del modelo GLB"
          >
            <Zap className="w-4 h-4 shrink-0" />
            <span>{isOptimized ? 'Optimizado' : 'Optimizar'}</span>
          </button>
        )}

        {/* Theme Toggle */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className="flex items-center justify-center w-9 h-9 rounded-xl border border-slate-700/80 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white transition-all cursor-pointer shrink-0"
            title={theme === 'dark' ? 'Cambiar a Modo Claro ☀️' : 'Cambiar a Modo Oscuro 🌙'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400" />
            )}
          </button>
        )}

        <div className="w-px h-5 bg-slate-800 my-auto shrink-0" />

        {/* Open Local File */}
        <button
          onClick={onOpenLocalFile}
          className="flex items-center gap-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800/80 px-3 py-2 rounded-xl transition-all cursor-pointer shrink-0"
          title="Abrir otro archivo .glb o .gltf desde tu equipo"
        >
          <FolderOpen className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Local</span>
        </button>
      </div>
    </div>
  );
};

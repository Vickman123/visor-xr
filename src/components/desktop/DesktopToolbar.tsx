import React, { useState } from 'react';
import type { ModelTransform } from '../../types';
import {
  RotateCcw,
  Maximize,
  Sliders,
  Home,
  FolderOpen,
  ChevronUp,
  ChevronDown,
  Camera,
} from 'lucide-react';

interface DesktopToolbarProps {
  onBackToCatalog: () => void;
  onResetCamera: () => void;
  onFrameModel: () => void;
  onResetTransform: () => void;
  onOpenLocalFile: () => void;
  onTakeSnapshot?: () => void;
  transform: ModelTransform;
  onTransformChange: (updater: (prev: ModelTransform) => ModelTransform) => void;
}

export const DesktopToolbar: React.FC<DesktopToolbarProps> = ({
  onBackToCatalog,
  onResetCamera,
  onFrameModel,
  onResetTransform,
  onOpenLocalFile,
  onTakeSnapshot,
  transform,
  onTransformChange,
}) => {
  const [showTransformPanel, setShowTransformPanel] = useState(false);

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3">
      {/* Expanded Transform Manipulation Drawer */}
      {showTransformPanel && (
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 shadow-2xl w-80 text-xs text-slate-200 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-semibold text-cyan-400 uppercase tracking-wider">
              Manipulación del Modelo
            </span>
            <button
              onClick={onResetTransform}
              className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
            >
              Reset transform
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

      {/* Main Glassmorphism Bar */}
      <div className="flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md border border-slate-700/70 p-1.5 rounded-2xl shadow-2xl">
        <button
          onClick={onBackToCatalog}
          className="flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
          title="Regresar a biblioteca de proyectos"
        >
          <Home className="w-4 h-4 text-cyan-400" />
          <span>Biblioteca</span>
        </button>

        <div className="w-px h-5 bg-slate-800 my-auto" />

        <button
          onClick={onResetCamera}
          className="flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 px-3 py-2 rounded-xl transition-all cursor-pointer"
          title="Restablecer posición de cámara"
        >
          <RotateCcw className="w-4 h-4 text-slate-400" />
          <span>Reset Cámara</span>
        </button>

        <button
          onClick={onFrameModel}
          className="flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 px-3 py-2 rounded-xl transition-all cursor-pointer"
          title="Centrar y ajustar modelo a la cámara"
        >
          <Maximize className="w-4 h-4 text-slate-400" />
          <span>Ajustar Modelo</span>
        </button>

        {onTakeSnapshot && (
          <button
            onClick={onTakeSnapshot}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-gradient-to-r from-amber-500/80 to-amber-600/80 hover:from-amber-400 hover:to-amber-500 active:scale-95 px-3 py-2 rounded-xl transition-all cursor-pointer shadow-sm shadow-amber-500/20"
            title="Tomar foto / captura realista del modelo y guardarla como portada"
          >
            <Camera className="w-4 h-4" />
            <span>📸 Capturar Foto</span>
          </button>
        )}

        <button
          onClick={() => setShowTransformPanel(!showTransformPanel)}
          className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-xl transition-all cursor-pointer ${
            showTransformPanel
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
          }`}
          title="Herramientas de mover, rotar y escalar"
        >
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>Manipulación</span>
          {showTransformPanel ? (
            <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>

        <div className="w-px h-5 bg-slate-800 my-auto" />

        <button
          onClick={onOpenLocalFile}
          className="flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 px-3 py-2 rounded-xl transition-all cursor-pointer"
          title="Abrir otro archivo .glb o .gltf desde tu equipo"
        >
          <FolderOpen className="w-4 h-4 text-amber-400" />
          <span>Abrir Local</span>
        </button>
      </div>
    </div>
  );
};

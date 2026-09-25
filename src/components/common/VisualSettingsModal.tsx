import React from 'react';
import { Sun, Shield, Eye, Layers, RotateCw, X, Sparkles } from 'lucide-react';
import type { LightingPreset } from '../scene/Lighting';

interface VisualSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lightingPreset: LightingPreset;
  onLightingPresetChange: (preset: LightingPreset) => void;
  enableShadows: boolean;
  onToggleShadows: () => void;
  wireframe: boolean;
  onToggleWireframe: () => void;
  showPedestal: boolean;
  onTogglePedestal: () => void;
  autoRotate: boolean;
  onToggleAutoRotate: () => void;
}

export const VisualSettingsModal: React.FC<VisualSettingsModalProps> = ({
  isOpen,
  onClose,
  lightingPreset,
  onLightingPresetChange,
  enableShadows,
  onToggleShadows,
  wireframe,
  onToggleWireframe,
  showPedestal,
  onTogglePedestal,
  autoRotate,
  onToggleAutoRotate,
}) => {
  if (!isOpen) return null;

  const presets: { id: LightingPreset; label: string; desc: string; icon: string }[] = [
    { id: 'city', label: 'Ciudad HD', desc: 'Reflejos urbanos equilibrados', icon: '🏙️' },
    { id: 'studio', label: 'Estudio de Fotografía', desc: 'Iluminación de catálogo suave', icon: '💡' },
    { id: 'sunset', label: 'Atardecer Cálido', desc: 'Tonos dorados y sombras dramáticas', icon: '🌅' },
    { id: 'neutral', label: 'Luz Neutral Estándar', desc: 'Sin reflejos de mapa HDRI', icon: '☀️' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Ajustes de Visualización HD
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
              <p className="text-xs text-slate-400">Optimiza la renderización y la iluminación 3D</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Lighting Presets */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Entorno e Iluminación (HDRI)
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {presets.map((p) => {
                const isActive = lightingPreset === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => onLightingPresetChange(p.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isActive
                        ? 'bg-amber-500/10 border-amber-500/60 text-amber-200 shadow-md'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="text-base mb-1">{p.icon}</div>
                    <div className="text-xs font-bold">{p.label}</div>
                    <div className="text-[10px] text-slate-400 line-clamp-1">{p.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Render Toggles */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Opciones de Renderizado
            </label>

            <div className="space-y-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              {/* Shadows */}
              <div className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2.5 text-xs text-slate-200">
                  <Shield className="w-4 h-4 text-sky-400" />
                  <span>Sombras en Tiempo Real</span>
                </div>
                <input
                  type="checkbox"
                  checked={enableShadows}
                  onChange={onToggleShadows}
                  className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
                />
              </div>

              {/* Wireframe */}
              <div className="flex items-center justify-between py-1.5 border-t border-slate-800/80">
                <div className="flex items-center gap-2.5 text-xs text-slate-200">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span>Modo Alambre (Wireframe)</span>
                </div>
                <input
                  type="checkbox"
                  checked={wireframe}
                  onChange={onToggleWireframe}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </div>

              {/* Pedestal / Grid */}
              <div className="flex items-center justify-between py-1.5 border-t border-slate-800/80">
                <div className="flex items-center gap-2.5 text-xs text-slate-200">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>Pedestal y Rejilla de Suelo</span>
                </div>
                <input
                  type="checkbox"
                  checked={showPedestal}
                  onChange={onTogglePedestal}
                  className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                />
              </div>

              {/* Auto Rotate */}
              <div className="flex items-center justify-between py-1.5 border-t border-slate-800/80">
                <div className="flex items-center gap-2.5 text-xs text-slate-200">
                  <RotateCw className="w-4 h-4 text-amber-400" />
                  <span>Rotación Automática</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoRotate}
                  onChange={onToggleAutoRotate}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-slate-800 bg-slate-900/90">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-xs font-bold text-slate-950 transition-colors"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

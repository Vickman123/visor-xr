import React, { useState } from 'react';
import * as THREE from 'three';
import {
  Zap,
  Sliders,
  Check,
  Download,
  RotateCcw,
  X,
  Cpu,
  Layers,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { optimizeModelScene, exportSceneToGLB } from '../../utils/meshOptimizer';
import { formatNumber } from '../../utils/modelMetrics';
import type { ModelMetrics } from '../../types';

interface MeshOptimizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalScene: THREE.Group | null;
  metrics: ModelMetrics | null;
  onApplyOptimization: (optimizedScene: THREE.Group, newMetrics: ModelMetrics) => void;
  onRestoreOriginal: () => void;
  isOptimized?: boolean;
}

export const MeshOptimizationModal: React.FC<MeshOptimizationModalProps> = ({
  isOpen,
  onClose,
  originalScene,
  metrics,
  onApplyOptimization,
  onRestoreOriginal,
  isOptimized = false,
}) => {
  const [targetRatio, setTargetRatio] = useState<number>(0.5); // Default 50% reduction
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Preview estimated numbers
  const origTris = metrics?.triangleCount || 0;
  const origVerts = metrics?.vertexCount || 0;
  const estTris = Math.round(origTris * (1 - targetRatio));
  const estVerts = Math.round(origVerts * (1 - targetRatio));

  if (!isOpen || !originalScene) return null;

  const handleRunOptimization = async () => {
    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      // Execute internal decimation algorithm asynchronously
      const result = await optimizeModelScene(
        originalScene,
        {
          targetRatio,
          recomputeNormals: true,
          makeDoubleSided: true,
        },
        (pct) => setProgress(pct)
      );

      onApplyOptimization(result.optimizedScene, result.metrics);
      setIsProcessing(false);
      onClose();
    } catch (err) {
      console.error('Failed to optimize mesh:', err);
      setError('Ocurrió un error al procesar la optimización de la malla.');
      setIsProcessing(false);
    }
  };

  const handleDownloadGLB = async () => {
    if (!originalScene) return;
    setIsProcessing(true);
    try {
      const result = await optimizeModelScene(originalScene, { targetRatio });
      await exportSceneToGLB(result.optimizedScene, 'modelo_optimizado.glb');
      setIsProcessing(false);
    } catch (err) {
      console.error('Failed to export GLB:', err);
      setError('Error al exportar el archivo GLB optimizado.');
      setIsProcessing(false);
    }
  };

  const getPerformanceStatus = (triangles: number) => {
    if (triangles <= 300000) {
      return {
        label: '🟢 Excelente Rendimiento en Meta Quest 3S (60-90 FPS Fluidos)',
        color: 'text-emerald-400 bg-emerald-950/80 border-emerald-800',
        dot: 'bg-emerald-400',
      };
    } else if (triangles <= 550000) {
      return {
        label: '🟡 Rendimiento Moderado en Standalone VR',
        color: 'text-amber-400 bg-amber-950/80 border-amber-800',
        dot: 'bg-amber-400',
      };
    } else {
      return {
        label: '🔴 Malla Muy Pesada para VR (Se Recomienda Optimizar)',
        color: 'text-rose-400 bg-rose-950/80 border-rose-800',
        dot: 'bg-rose-400',
      };
    }
  };

  const currentStatus = getPerformanceStatus(isOptimized ? origTris : estTris);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Algoritmo de Optimización Interno
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
              <p className="text-xs text-slate-400">
                Reducción y simplificación inteligente de polígonos manteniendo la forma 3D
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3.5 bg-rose-950/60 border border-rose-800/80 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Performance Badge */}
          <div className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${currentStatus.color}`}>
            <span className={`w-2.5 h-2.5 rounded-full ${currentStatus.dot} animate-pulse`} />
            <span className="font-semibold">{currentStatus.label}</span>
          </div>

          {/* Interactive Target Reduction Slider */}
          <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-slate-300 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-sky-400" /> Nivel de Reducción de Polígonos:
              </span>
              <span className="text-sky-400 font-mono font-bold text-base">
                {Math.round(targetRatio * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.10"
              max="0.85"
              step="0.05"
              value={targetRatio}
              disabled={isProcessing}
              onChange={(e) => setTargetRatio(parseFloat(e.target.value))}
              className="w-full accent-sky-400 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>10% (Conservador)</span>
              <span>50% (Recomendado)</span>
              <span>85% (Máxima Simplificación)</span>
            </div>
          </div>

          {/* Stats Comparison Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Original Metrics */}
            <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
              <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400" /> Malla Actual
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Polígonos:</span>
                  <span className="font-mono text-slate-200">{formatNumber(origTris)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Vértices:</span>
                  <span className="font-mono text-slate-200">{formatNumber(origVerts)}</span>
                </div>
              </div>
            </div>

            {/* Optimized Estimate */}
            <div className="p-4 bg-sky-950/30 rounded-xl border border-sky-800/40 space-y-2">
              <div className="text-xs font-semibold text-sky-400 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-sky-400" /> Estimado Optimizado
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Polígonos:</span>
                  <span className="font-mono text-sky-300 font-bold">{formatNumber(estTris)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Vértices:</span>
                  <span className="font-mono text-sky-300">{formatNumber(estVerts)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Processing Progress Bar */}
          {isProcessing && (
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs text-sky-400">
                <span>Ejecutando algoritmo de desimación de malla...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-sky-500 to-emerald-400 h-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            {isOptimized && (
              <button
                onClick={() => {
                  onRestoreOriginal();
                  onClose();
                }}
                disabled={isProcessing}
                className="px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Restaurar Original
              </button>
            )}

            <button
              onClick={handleDownloadGLB}
              disabled={isProcessing}
              className="px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 flex items-center gap-1.5 transition-colors"
              title="Descargar versión optimizada como GLB"
            >
              <Download className="w-3.5 h-3.5" /> Descargar GLB
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-medium text-slate-300 transition-colors"
            >
              Cancelar
            </button>

            <button
              onClick={handleRunOptimization}
              disabled={isProcessing}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-xs font-bold text-white shadow-lg shadow-sky-500/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {isProcessing ? 'Optimizando...' : 'Aplicar Optimización'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

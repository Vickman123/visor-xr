import React from 'react';
import type { ModelMetrics, Project } from '../../types';
import { formatBytes, formatNumber } from '../../utils/modelMetrics';
import { AlertTriangle, Box, Layers, Maximize2 } from 'lucide-react';

interface MetricsHUDProps {
  project: Project | null;
  metrics: ModelMetrics | null;
}

export const MetricsHUD: React.FC<MetricsHUDProps> = ({ project, metrics }) => {
  if (!project && !metrics) return null;

  return (
    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 max-w-sm pointer-events-none select-none">
      {/* Project Identity Card */}
      <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-xl p-4 shadow-2xl pointer-events-auto">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <h2 className="text-sm font-semibold tracking-wide uppercase text-cyan-400">
            {project?.isLocal ? 'Archivo Local' : 'Proyecto'}
          </h2>
        </div>
        <h1 className="text-lg font-bold text-white tracking-tight truncate">
          {project?.name || 'Modelo 3D'}
        </h1>
        {project?.description && (
          <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
            {project.description}
          </p>
        )}

        {/* Real Dimensions & Metrics */}
        {metrics && (
          <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Maximize2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                {metrics.dimensions.width}m × {metrics.dimensions.depth}m
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Box className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Alto: {metrics.dimensions.height}m</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{formatNumber(metrics.triangleCount)} tris</span>
            </div>
            {metrics.fileSizeBytes && (
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="text-slate-400 font-mono text-[10px]">PESO:</span>
                <span>{formatBytes(metrics.fileSizeBytes)}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Performance Warning if model is extremely heavy for Meta Quest 3S */}
      {metrics?.isHeavy && (
        <div className="bg-amber-950/90 backdrop-blur-md border border-amber-600/70 text-amber-200 text-xs rounded-xl p-3 shadow-lg flex items-start gap-2.5 pointer-events-auto">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-300 block">
              Advertencia de Rendimiento
            </span>
            <p className="text-amber-200/90 text-[11px] leading-snug mt-0.5">
              Este modelo contiene una densidad de polígonos elevada ({formatNumber(metrics.triangleCount)} tris). Podría experimentar caídas de cuadros en Meta Quest 3S.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

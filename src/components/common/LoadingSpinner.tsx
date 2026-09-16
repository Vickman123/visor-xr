import React from 'react';

interface LoadingSpinnerProps {
  progress?: number;
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  progress = 0,
  message = 'Cargando modelo arquitectónico...',
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-6 shadow-2xl flex flex-col items-center max-w-xs text-center">
        <div className="relative w-12 h-12 mb-4">
          <div className="w-12 h-12 rounded-full border-2 border-slate-800" />
          <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
        </div>
        <span className="text-sm font-semibold text-white tracking-tight">
          {message}
        </span>
        {progress > 0 && (
          <div className="w-full mt-3">
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Descargando geometría</span>
              <span className="font-mono text-cyan-400">{progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

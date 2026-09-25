import React from 'react';
import { AlertCircle, ArrowLeft } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
  onBack: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onBack }) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-red-800/80 rounded-3xl p-6 shadow-2xl max-w-md w-full text-center">
        <div className="w-12 h-12 rounded-2xl bg-red-950/60 border border-red-800/50 flex items-center justify-center text-red-400 mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Error al Cargar</h3>
        <p className="text-xs text-slate-300 mb-6 leading-relaxed">
          {message}
        </p>
        <button
          onClick={onBack}
          className="inline-flex items-center justify-center gap-2 w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs py-3 px-4 rounded-xl transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a la Biblioteca</span>
        </button>
      </div>
    </div>
  );
};

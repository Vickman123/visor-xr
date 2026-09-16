import React from 'react';
import { useWebXRSupport } from '../../hooks/useWebXRSupport';
import { xrStore } from '../xr/xrStore';
import { Glasses, Info } from 'lucide-react';

export const WebXRButton: React.FC = () => {
  const { isSupported, isChecking, error } = useWebXRSupport();

  const handleEnterVR = async () => {
    try {
      await xrStore.enterVR();
    } catch (err) {
      console.error('Error entering VR:', err);
    }
  };

  if (isChecking) {
    return (
      <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-700 text-xs text-slate-300">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        Verificando WebXR...
      </div>
    );
  }

  if (!isSupported) {
    return (
      <div className="flex flex-col items-end gap-1.5 max-w-xs">
        <button
          disabled
          className="flex items-center gap-2.5 bg-slate-800/60 text-slate-400 px-4 py-2.5 rounded-xl border border-slate-700/80 text-sm font-medium cursor-not-allowed opacity-80"
          title={error || 'WebXR no disponible'}
        >
          <Glasses className="w-4 h-4 text-slate-500" />
          <span>🥽 Entrar en VR</span>
        </button>
        <div className="flex items-center gap-1.5 text-[11px] text-amber-300/90 bg-amber-950/70 border border-amber-800/60 px-2.5 py-1 rounded-lg">
          <Info className="w-3.5 h-3.5 shrink-0 text-amber-400" />
          <span>WebXR no está disponible en este navegador o dispositivo.</span>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleEnterVR}
      className="group relative flex items-center gap-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-5 py-3 rounded-xl shadow-lg shadow-cyan-500/25 transition-all duration-200 hover:scale-105 active:scale-95 font-semibold text-sm cursor-pointer"
    >
      <Glasses className="w-5 h-5 transition-transform group-hover:rotate-12" />
      <span>🥽 Entrar en VR</span>
    </button>
  );
};

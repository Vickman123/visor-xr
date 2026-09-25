import React from 'react';
import { useWebXRSupport } from '../../hooks/useWebXRSupport';
import { xrStore } from '../xr/xrStore';
import { Glasses, Camera } from 'lucide-react';

export const WebXRButton: React.FC = () => {
  const { isSupported, isVRSupported, isARSupported, isChecking } = useWebXRSupport();

  const handleEnterVR = async () => {
    try {
      await xrStore.enterVR();
    } catch (err) {
      console.error('Error entering VR:', err);
    }
  };

  const handleEnterAR = async () => {
    try {
      await xrStore.enterAR();
    } catch (err) {
      console.error('Error entering AR:', err);
    }
  };

  if (isChecking || !isSupported) {
    return null;
  }

  return (
    <div className="flex items-center gap-2.5">
      {/* Realidad Aumentada / Passthrough con cámaras Meta Quest 3S */}
      {isARSupported && (
        <button
          onClick={handleEnterAR}
          className="group flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-95 text-white px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-500/25 transition-all text-xs sm:text-sm font-bold cursor-pointer"
          title="Activar visión con cámara en Realidad Aumentada (Passthrough de Meta Quest 3S)"
        >
          <Camera className="w-4 h-4 transition-transform group-hover:scale-110" />
          <span>👓 Entrar en AR</span>
        </button>
      )}

      {/* Realidad Virtual Inmersiva */}
      {isVRSupported && (
        <button
          onClick={handleEnterVR}
          className="group flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 text-white px-4 py-2.5 rounded-xl shadow-lg shadow-cyan-500/25 transition-all text-xs sm:text-sm font-bold cursor-pointer"
          title="Entrar en Realidad Virtual inmersiva completa"
        >
          <Glasses className="w-4 h-4 transition-transform group-hover:rotate-12" />
          <span>🥽 Entrar en VR</span>
        </button>
      )}
    </div>
  );
};

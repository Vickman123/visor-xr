import { useState, useEffect } from 'react';
import type { WebXRSupportState } from '../types';

export function useWebXRSupport(): WebXRSupportState {
  const [state, setState] = useState<WebXRSupportState>({
    isSupported: false,
    isVRSupported: false,
    isARSupported: false,
    isChecking: true,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!('xr' in navigator) || !navigator.xr) {
      setState({
        isSupported: false,
        isVRSupported: false,
        isARSupported: false,
        isChecking: false,
        error: 'WebXR no está disponible en este navegador o dispositivo.',
      });
      return;
    }

    Promise.all([
      navigator.xr.isSessionSupported('immersive-vr').catch(() => false),
      navigator.xr.isSessionSupported('immersive-ar').catch(() => false),
    ])
      .then(([vrSupported, arSupported]) => {
        const supported = vrSupported || arSupported;
        setState({
          isSupported: supported,
          isVRSupported: vrSupported,
          isARSupported: arSupported,
          isChecking: false,
          error: supported ? undefined : 'WebXR no está disponible en este navegador o dispositivo.',
        });
      })
      .catch((err) => {
        console.warn('Error checking WebXR support:', err);
        setState({
          isSupported: false,
          isVRSupported: false,
          isARSupported: false,
          isChecking: false,
          error: 'WebXR no está disponible en este navegador o dispositivo.',
        });
      });
  }, []);

  return state;
}

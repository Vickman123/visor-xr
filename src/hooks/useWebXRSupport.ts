import { useState, useEffect } from 'react';
import type { WebXRSupportState } from '../types';

export function useWebXRSupport(): WebXRSupportState {
  const [state, setState] = useState<WebXRSupportState>({
    isSupported: false,
    isChecking: true,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!('xr' in navigator) || !navigator.xr) {
      setState({
        isSupported: false,
        isChecking: false,
        error: 'WebXR no está disponible en este navegador o dispositivo.',
      });
      return;
    }

    navigator.xr
      .isSessionSupported('immersive-vr')
      .then((supported) => {
        setState({
          isSupported: supported,
          isChecking: false,
          error: supported ? undefined : 'WebXR no está disponible en este navegador o dispositivo.',
        });
      })
      .catch((err) => {
        console.warn('Error checking WebXR support:', err);
        setState({
          isSupported: false,
          isChecking: false,
          error: 'WebXR no está disponible en este navegador o dispositivo.',
        });
      });
  }, []);

  return state;
}

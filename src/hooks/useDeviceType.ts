import { useState, useEffect } from 'react';

export function useDeviceType() {
  const [isMetaQuest, setIsMetaQuest] = useState<boolean>(() => {
    if (typeof navigator === 'undefined') return false;
    return /OculusBrowser|Quest/i.test(navigator.userAgent);
  });

  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) ||
      (window.innerWidth <= 768 && 'ontouchstart' in window);
  });

  const [isTablet, setIsTablet] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
    return /iPad|Tablet/i.test(navigator.userAgent) ||
      (window.innerWidth > 768 && window.innerWidth <= 1024 && 'ontouchstart' in window);
  });

  const [hasXRSupport, setHasXRSupport] = useState<boolean>(false);
  const [hasARSupport, setHasARSupport] = useState<boolean>(false);
  const [hasGyroscope, setHasGyroscope] = useState<boolean>(false);

  useEffect(() => {
    if (typeof navigator === 'undefined') return;

    const ua = navigator.userAgent;
    const isQuestUA = /OculusBrowser|Quest/i.test(ua);
    setIsMetaQuest(isQuestUA);

    const checkMobile = () => {
      const mob = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) ||
        (window.innerWidth <= 768 && 'ontouchstart' in window);
      setIsMobile(mob);
      setIsTablet(window.innerWidth > 768 && window.innerWidth <= 1024 && 'ontouchstart' in window);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Check device orientation / gyroscope capability
    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      setHasGyroscope(true);
    }

    // WebXR immersive checks
    if ('xr' in navigator && (navigator as any).xr?.isSessionSupported) {
      (navigator as any).xr
        .isSessionSupported('immersive-vr')
        .then((supported: boolean) => {
          setHasXRSupport(supported);
          if (supported) {
            setIsMetaQuest(true);
          }
        })
        .catch(() => {
          setHasXRSupport(false);
        });

      (navigator as any).xr
        .isSessionSupported('immersive-ar')
        .then((supported: boolean) => {
          setHasARSupport(supported);
        })
        .catch(() => {
          setHasARSupport(false);
        });
    }

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return { isMetaQuest, isMobile, isTablet, hasXRSupport, hasARSupport, hasGyroscope };
}

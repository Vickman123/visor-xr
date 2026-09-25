import { useState, useRef, useCallback, useEffect } from 'react';

export interface UseWebcamARResult {
  isWebcamActive: boolean;
  videoElement: HTMLVideoElement | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  startWebcam: () => Promise<boolean>;
  stopWebcam: () => void;
  toggleWebcam: () => Promise<boolean>;
  switchCamera: () => Promise<void>;
  captureCompositeSnapshot: (webglCanvas: HTMLCanvasElement | null) => string | null;
  facingMode: 'user' | 'environment';
  error: string | null;
  hasMultipleCameras: boolean;
}

export function useWebcamAR(): UseWebcamARResult {
  const [isWebcamActive, setIsWebcamActive] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Check available cameras
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');
        setHasMultipleCameras(videoDevices.length > 1);
      }).catch(() => {});
    }
  }, []);

  const stopWebcam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsWebcamActive(false);
    setError(null);
  }, []);

  const startWebcam = useCallback(async (desiredFacing: 'user' | 'environment' = facingMode): Promise<boolean> => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('La cámara web no es compatible con este navegador.');
      return false;
    }

    // Stop current stream if running
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    try {
      setError(null);
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: desiredFacing },
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      setIsWebcamActive(true);
      setFacingMode(desiredFacing);
      return true;
    } catch (err: any) {
      console.warn('Could not access camera with ideal constraints, trying fallback:', err);
      // Fallback: try basic video
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          await videoRef.current.play().catch(() => {});
        }
        setIsWebcamActive(true);
        return true;
      } catch (fallbackErr: any) {
        console.error('Webcam access error:', fallbackErr);
        setError('No se pudo acceder a la cámara. Revisa los permisos en tu navegador.');
        setIsWebcamActive(false);
        return false;
      }
    }
  }, [facingMode]);

  const toggleWebcam = useCallback(async (): Promise<boolean> => {
    if (isWebcamActive) {
      stopWebcam();
      return false;
    } else {
      return await startWebcam();
    }
  }, [isWebcamActive, startWebcam, stopWebcam]);

  const switchCamera = useCallback(async () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    await startWebcam(nextFacing);
  }, [facingMode, startWebcam]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  /**
   * Captures a merged snapshot combining the live webcam background and the 3D model canvas.
   */
  const captureCompositeSnapshot = useCallback((webglCanvas: HTMLCanvasElement | null): string | null => {
    if (!videoRef.current || !webglCanvas) return null;

    try {
      const offscreen = document.createElement('canvas');
      const w = webglCanvas.width || 1920;
      const h = webglCanvas.height || 1080;
      offscreen.width = w;
      offscreen.height = h;

      const ctx = offscreen.getContext('2d');
      if (!ctx) return null;

      // Draw webcam frame
      const video = videoRef.current;
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        // Calculate cover crop for video
        const vAspect = video.videoWidth / video.videoHeight;
        const cAspect = w / h;
        let sx = 0, sy = 0, sw = video.videoWidth, sh = video.videoHeight;

        if (vAspect > cAspect) {
          sw = video.videoHeight * cAspect;
          sx = (video.videoWidth - sw) / 2;
        } else {
          sh = video.videoWidth / cAspect;
          sy = (video.videoHeight - sh) / 2;
        }

        ctx.drawImage(video, sx, sy, sw, sh, 0, 0, w, h);
      } else {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, w, h);
      }

      // Draw WebGL layer over the camera
      ctx.drawImage(webglCanvas, 0, 0, w, h);

      return offscreen.toDataURL('image/jpeg', 0.95);
    } catch (e) {
      console.error('Error creating AR composite snapshot:', e);
      return null;
    }
  }, []);

  return {
    isWebcamActive,
    videoElement: videoRef.current,
    videoRef,
    startWebcam,
    stopWebcam,
    toggleWebcam,
    switchCamera,
    captureCompositeSnapshot,
    facingMode,
    error,
    hasMultipleCameras,
  };
}

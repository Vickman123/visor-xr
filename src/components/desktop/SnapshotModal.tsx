import React, { useState } from 'react';
import type { Project } from '../../types';
import { Camera, Download, Check, Star, X } from 'lucide-react';

interface SnapshotModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  project: Project;
  onClose: () => void;
  onSetAsCover: (dataUrl: string) => void;
}

export const SnapshotModal: React.FC<SnapshotModalProps> = ({
  isOpen,
  imageSrc,
  project,
  onClose,
  onSetAsCover,
}) => {
  const [savedCover, setSavedCover] = useState(false);

  if (!isOpen || !imageSrc) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = `captura-${project.id}-${Date.now()}.jpg`;
    link.href = imageSrc;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSetCover = () => {
    try {
      localStorage.setItem(`custom_thumb_${project.id}`, imageSrc);
      onSetAsCover(imageSrc);
      setSavedCover(true);
      setTimeout(() => setSavedCover(false), 3000);
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Captura Realista del Modelo
              </h3>
              <p className="text-[11px] text-slate-400">
                {project.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Image Preview Container */}
        <div className="p-6 flex flex-col items-center gap-4 bg-slate-950/60">
          <div className="relative aspect-[16/10] w-full max-h-80 rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-950 flex items-center justify-center">
            <img
              src={imageSrc}
              alt="Captura 3D del proyecto"
              className="w-full h-full object-contain"
            />
            {savedCover && (
              <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-emerald-300 gap-2 animate-in fade-in duration-200">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Check className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold">¡Guardada como Foto de Portada!</span>
                <span className="text-xs text-emerald-400/80">Ahora acompañará a este modelo en el catálogo.</span>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-400 text-center max-w-md">
            Esta captura refleja la iluminación, perspectiva y escala exacta que configuraste. Puedes descargarla o usarla directamente como portada realista en la biblioteca.
          </p>
        </div>

        {/* Actions Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-700 transition-all cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Descargar Imagen HD</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSetCover}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs tracking-wide transition-all cursor-pointer shadow-lg shadow-amber-500/20"
            >
              <Star className="w-4 h-4 fill-slate-950" />
              <span>Usar como Portada</span>
            </button>
            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-700/60 transition-all cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

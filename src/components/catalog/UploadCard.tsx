import React, { useState } from 'react';
import { Plus, UploadCloud } from 'lucide-react';
import type { Project } from '../../types';

interface UploadCardProps {
  onOpenLocalFileModal: () => void;
  onFileDrop?: (project: Project, file: File) => void;
}

export const UploadCard: React.FC<UploadCardProps> = ({
  onOpenLocalFileModal,
  onFileDrop,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'glb' || ext === 'gltf') {
        const dummyProject: Project = {
          id: `local-${Date.now()}`,
          name: file.name.replace(/\.[^/.]+$/, ''),
          description: 'Modelo 3D cargado localmente.',
          thumbnail: '',
          model: file.name,
          isLocal: true,
          category: 'Personalizado',
        };
        if (onFileDrop) {
          onFileDrop(dummyProject, file);
        } else {
          onOpenLocalFileModal();
        }
      } else {
        onOpenLocalFileModal();
      }
    }
  };

  return (
    <div
      onClick={onOpenLocalFileModal}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`group relative flex flex-col items-center justify-center w-64 sm:w-72 h-[340px] sm:h-[370px] rounded-3xl backdrop-blur-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer overflow-hidden p-6 shrink-0 select-none ${
        isDragOver
          ? 'bg-cyan-950/60 border-2 border-cyan-300 shadow-[0_0_50px_rgba(6,182,212,0.6)] scale-102'
          : 'bg-slate-900/40 hover:bg-slate-900/60 border-2 border-cyan-400/90 shadow-[0_0_35px_rgba(6,182,212,0.35)] hover:shadow-[0_0_50px_rgba(6,182,212,0.55)]'
      }`}
    >
      {/* Inner ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 via-transparent to-white/[0.04] pointer-events-none" />

      {/* Large Glowing Center Plus Icon */}
      <div className="relative z-10 w-20 h-20 rounded-3xl bg-cyan-500/10 group-hover:bg-cyan-500/20 border border-cyan-400/40 group-hover:border-cyan-400 flex items-center justify-center text-cyan-300 group-hover:text-cyan-200 transition-all duration-300 mb-6 shadow-[0_0_25px_rgba(6,182,212,0.25)]">
        {isDragOver ? (
          <UploadCloud className="w-10 h-10 animate-bounce text-cyan-300" />
        ) : (
          <Plus className="w-10 h-10 stroke-[2.5] transition-transform duration-300 group-hover:scale-115" />
        )}
      </div>

      {/* Text Label matching reference */}
      <h3 className="relative z-10 text-lg font-bold text-white tracking-tight group-hover:text-cyan-300 transition-colors mb-2">
        {isDragOver ? 'Suelta tu archivo aquí' : 'Cargar modelo'}
      </h3>

      {/* Formats metadata */}
      <p className="relative z-10 text-xs text-slate-400 tracking-wider uppercase font-medium">
        GLB · GLTF · FBX · OBJ
      </p>

      {/* Drag & drop hint */}
      <div className="absolute bottom-5 text-[10px] text-slate-400/80 font-medium px-3 py-1 rounded-full bg-slate-950/40 border border-white/5">
        Arrastra un archivo o haz clic
      </div>
    </div>
  );
};

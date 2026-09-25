import React, { useRef, useState } from 'react';
import type { Project } from '../../types';
import { UploadCloud, X, CheckCircle2 } from 'lucide-react';

interface LocalFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (project: Project, file: File) => void;
}

export const LocalFileModal: React.FC<LocalFileModalProps> = ({
  isOpen,
  onClose,
  onFileSelect,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const processFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'glb' && ext !== 'gltf') {
      alert('Por favor selecciona un archivo con extensión .glb o .gltf.');
      return;
    }

    const cleanName = file.name.replace(/\.[^/.]+$/, '');
    const localProject: Project = {
      id: `local-${Date.now()}`,
      name: cleanName,
      description: `Archivo cargado localmente (${(file.size / (1024 * 1024)).toFixed(2)} MB). Procesado 100% en el cliente.`,
      thumbnail: '',
      model: '',
      isLocal: true,
    };

    onFileSelect(localProject, file);
    onClose();
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-white tracking-tight">
          Abrir Archivo Local
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Carga cualquier modelo 3D en formato GLB o GLTF directamente en tu navegador.
        </p>

        {/* Drag & Drop Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`mt-6 border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
            dragActive
              ? 'border-cyan-400 bg-cyan-950/30 scale-[1.01]'
              : 'border-slate-700 hover:border-slate-500 bg-slate-950/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".glb,.gltf"
            onChange={handleChange}
            className="hidden"
          />

          <div className="w-14 h-14 rounded-2xl bg-cyan-950/50 border border-cyan-800/50 flex items-center justify-center text-cyan-400 mb-3">
            <UploadCloud className="w-7 h-7" />
          </div>

          <span className="text-sm font-semibold text-slate-200">
            Arrastra tu archivo aquí o haz clic para examinar
          </span>
          <span className="text-xs text-slate-400 mt-1">
            Formatos soportados: <strong className="text-cyan-400">.GLB</strong> y{' '}
            <strong className="text-cyan-400">.GLTF</strong>
          </span>
        </div>

        {/* Security & Privacy Notice */}
        <div className="mt-5 p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-start gap-3 text-xs text-slate-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white block">
              100% Privado y Local
            </span>
            <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
              El archivo se procesa íntegramente en la memoria de tu navegador. Ningún dato o modelo se sube a servidores externos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

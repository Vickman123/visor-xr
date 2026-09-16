import React, { useState, useEffect, useRef } from 'react';
import type { Project } from '../../types';
import { ProjectCard } from './ProjectCard';
import { DEFAULT_PROJECTS } from '../../data/defaultProjects';
import { FolderOpen, Layers, Glasses, Sparkles, ChevronDown, ChevronUp, Camera } from 'lucide-react';

interface ProjectCatalogProps {
  onSelectProject: (project: Project, file?: File) => void;
  onEnterVRProject: (project: Project) => void;
  onEnterARProject: (project: Project) => void;
  onOpenLocalFileModal: () => void;
}

export const ProjectCatalog: React.FC<ProjectCatalogProps> = ({
  onSelectProject,
  onEnterVRProject,
  onEnterARProject,
  onOpenLocalFileModal,
}) => {
  const [projects, setProjects] = useState<Project[]>(DEFAULT_PROJECTS);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const baseUrl = import.meta.env.BASE_URL || '/';
    const jsonUrl = `${baseUrl}${baseUrl.endsWith('/') ? '' : '/'}projects.json`;

    fetch(jsonUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data: Project[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setProjects(data);
        }
      })
      .catch((err) => {
        console.warn('Using default projects fallback:', err);
      });
  }, []);

  const scrollToCard = (id: string) => {
    const el = document.getElementById(`card-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const scrollDown = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ top: 400, behavior: 'smooth' });
    } else {
      window.scrollBy({ top: 400, behavior: 'smooth' });
    }
  };

  const scrollUp = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ top: -400, behavior: 'smooth' });
    } else {
      window.scrollBy({ top: -400, behavior: 'smooth' });
    }
  };

  const latestProject = projects[0] || DEFAULT_PROJECTS[0];

  return (
    <div
      ref={containerRef}
      className="w-full min-h-screen overflow-y-auto bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white"
    >
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white">
              <Glasses className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                XR Model Viewer
                <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                  AR / VR Quest 3S
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Immersive 3D & Augmented Reality Visualization
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Direct Quick AR Entry in Navbar */}
            <button
              onClick={() => onEnterARProject(latestProject)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-95 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer shadow-lg shadow-emerald-500/25"
              title="Entrar en Realidad Aumentada (Passthrough con cámaras reales de Meta Quest 3S)"
            >
              <Camera className="w-4 h-4" />
              <span>👓 Entrar en AR</span>
            </button>

            {/* Direct Quick VR Entry in Navbar */}
            <button
              onClick={() => onEnterVRProject(latestProject)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer shadow-lg shadow-cyan-500/25"
              title="Entrar en Realidad Virtual inmersiva completa"
            >
              <Glasses className="w-4 h-4" />
              <span className="hidden sm:inline">🥽 Entrar en VR</span>
              <span className="sm:hidden">VR</span>
            </button>

            <button
              onClick={onOpenLocalFileModal}
              className="flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide border border-slate-700 transition-all cursor-pointer shadow-sm"
              title="Abrir archivo .glb/.gltf desde tu equipo"
            >
              <FolderOpen className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Abrir local</span>
            </button>
          </div>
        </div>

        {/* Quick Navigation Tabs for Meta Quest Laser Pointer */}
        <div className="border-t border-slate-800/60 bg-slate-950/40 px-4 py-2 overflow-x-auto flex items-center gap-2 text-xs">
          <span className="text-slate-400 text-[11px] font-medium mr-1 shrink-0">
            Ir a:
          </span>
          {projects.map((proj) => (
            <button
              key={proj.id}
              onClick={() => scrollToCard(proj.id)}
              className="shrink-0 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 px-3 py-1.5 rounded-lg transition-all cursor-pointer text-xs"
            >
              {proj.name}
            </button>
          ))}
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 w-full">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-800/60 text-emerald-400 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Módulo Reciente: Facultad de Filosofía y Letras</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            Explora proyectos arquitectónicos en AR, VR y PC
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed mb-6">
            Visualiza modelos volumétricos sobre tu mesa física con Passthrough (AR), recorre a escala 1:1 en Realidad Virtual, o inspecciona en tu navegador web.
          </p>

          {/* Big Featured Action Buttons for Quest 3S */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onEnterARProject(latestProject)}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-95 text-white px-5 py-3.5 rounded-2xl text-sm font-bold tracking-wide shadow-xl shadow-emerald-500/25 transition-all cursor-pointer"
            >
              <Camera className="w-5 h-5" />
              <span>👓 Entrar en AR (Cámara Passthrough)</span>
            </button>
            <button
              onClick={() => onEnterVRProject(latestProject)}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 text-white px-5 py-3.5 rounded-2xl text-sm font-bold tracking-wide shadow-xl shadow-cyan-500/25 transition-all cursor-pointer"
            >
              <Glasses className="w-5 h-5" />
              <span>🥽 Entrar en VR Inmersivo</span>
            </button>
            <button
              onClick={() => onSelectProject(latestProject)}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white px-5 py-3.5 rounded-2xl text-sm font-semibold border border-slate-700/80 transition-all cursor-pointer"
            >
              <span>Ver en 3D (PC)</span>
            </button>
          </div>
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onSelect={onSelectProject}
              onEnterVR={onEnterVRProject}
              onEnterAR={onEnterARProject}
            />
          ))}
        </div>

        {/* Feature Highlights */}
        <div className="mt-14 border-t border-slate-800/60 pt-8 grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-slate-400">
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/60">
            <h4 className="font-semibold text-slate-200 mb-1 flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-400" />
              Realidad Aumentada (Passthrough)
            </h4>
            <p className="leading-relaxed">
              Activa la cámara a color del Meta Quest 3S para colocar la maqueta volumétrica directamente en tu mesa o sala de estar.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/60">
            <h4 className="font-semibold text-slate-200 mb-1 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Modo Maqueta & Escala 1:1
            </h4>
            <p className="leading-relaxed">
              Examina volumetrías en escala de mesa o ingresa al interior para recorrer la estructura a escala real con teleport o joystick.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/60">
            <h4 className="font-semibold text-slate-200 mb-1 flex items-center gap-2">
              <Glasses className="w-4 h-4 text-blue-400" />
              Optimizado para Quest 3S
            </h4>
            <p className="leading-relaxed">
              Agarrar con el Grip, separar manos para escalar (*pinch-to-scale*), rotar con mandos y menú 3D flotante espacial.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-6 text-center text-xs text-slate-500">
        XR Model Viewer • Immersive 3D Visualization
      </footer>

      {/* Floating Scroll Buttons for Meta Quest Laser Pointer Navigation */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-2 pointer-events-auto">
        <button
          onClick={scrollUp}
          className="w-12 h-12 rounded-full bg-slate-900/90 border border-slate-700/80 hover:border-cyan-500 text-slate-200 hover:text-white flex items-center justify-center shadow-2xl backdrop-blur-md transition-all active:scale-90 cursor-pointer"
          title="Subir página"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
        <button
          onClick={scrollDown}
          className="w-12 h-12 rounded-full bg-slate-900/90 border border-slate-700/80 hover:border-cyan-500 text-slate-200 hover:text-white flex items-center justify-center shadow-2xl backdrop-blur-md transition-all active:scale-90 cursor-pointer"
          title="Bajar página"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

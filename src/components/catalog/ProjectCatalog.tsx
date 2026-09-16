import React, { useState, useEffect } from 'react';
import type { Project } from '../../types';
import { ProjectCard } from './ProjectCard';
import { FolderOpen, Layers, Glasses, Sparkles, RefreshCw } from 'lucide-react';

interface ProjectCatalogProps {
  onSelectProject: (project: Project, file?: File) => void;
  onOpenLocalFileModal: () => void;
}

export const ProjectCatalog: React.FC<ProjectCatalogProps> = ({
  onSelectProject,
  onOpenLocalFileModal,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = () => {
    setIsLoading(true);
    setError(null);

    const baseUrl = import.meta.env.BASE_URL || '/';
    const jsonUrl = `${baseUrl}${baseUrl.endsWith('/') ? '' : '/'}projects.json`;

    fetch(jsonUrl)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data: Project[]) => {
        setProjects(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching projects:', err);
        setError('No se pudo cargar el catálogo de proyectos. Verifica projects.json.');
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="w-full min-h-screen overflow-y-auto bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white">
              <Glasses className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                XR Model Viewer
                <span className="text-[10px] uppercase font-semibold tracking-wider bg-cyan-950/80 text-cyan-400 border border-cyan-800/50 px-2 py-0.5 rounded-full">
                  Meta Quest 3S Ready
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Immersive 3D Visualization
              </p>
            </div>
          </div>

          <button
            onClick={onOpenLocalFileModal}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide border border-slate-700 transition-all cursor-pointer shadow-sm hover:border-cyan-500/50"
          >
            <FolderOpen className="w-4 h-4 text-amber-400" />
            <span>📂 Abrir archivo local</span>
          </button>
        </div>
      </header>

      {/* Hero Header */}
      <main className="max-w-7xl mx-auto px-6 py-12 flex-1 w-full">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 text-xs font-medium mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Biblioteca y Visor WebXR Profesional</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            Explora proyectos arquitectónicos en VR y PC
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Visualiza modelos volumétricos en modo maqueta o camina a escala 1:1 desde tu navegador de escritorio o mediante Meta Quest 3S con WebXR.
          </p>
        </div>

        {/* Dynamic Project Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
            <span className="text-sm font-medium text-slate-400">
              Cargando biblioteca de proyectos...
            </span>
          </div>
        ) : error ? (
          <div className="bg-red-950/40 border border-red-800/60 rounded-2xl p-6 text-center max-w-md mx-auto">
            <p className="text-sm text-red-300 mb-4">{error}</p>
            <button
              onClick={fetchProjects}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-900/60 hover:bg-red-900 text-red-100 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reintentar
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onSelect={(proj) => onSelectProject(proj)}
              />
            ))}
          </div>
        )}

        {/* Feature Highlights Banner */}
        <div className="mt-16 border-t border-slate-800/60 pt-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-400">
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/50">
            <h4 className="font-semibold text-slate-200 mb-1 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Modo Maqueta & Escala 1:1
            </h4>
            <p className="leading-relaxed">
              Examina volumetrías en escala de mesa o ingresa al interior para recorrer la estructura a escala real.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/50">
            <h4 className="font-semibold text-slate-200 mb-1 flex items-center gap-2">
              <Glasses className="w-4 h-4 text-blue-400" />
              Optimizado para Quest 3S
            </h4>
            <p className="leading-relaxed">
              Teleportación de bajo impacto, locomoción con joystick, agarre bimanual y menú 3D flotante espacial.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/50">
            <h4 className="font-semibold text-slate-200 mb-1 flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-amber-400" />
              100% Estático y Privado
            </h4>
            <p className="leading-relaxed">
              Carga tus propios archivos GLB/GLTF de forma local y segura sin enviar ningún archivo a servidores externos.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-6 text-center text-xs text-slate-500">
        XR Model Viewer • Immersive 3D Visualization
      </footer>
    </div>
  );
};

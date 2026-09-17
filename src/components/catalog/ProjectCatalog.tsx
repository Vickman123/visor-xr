import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Project } from '../../types';
import { ProjectCard } from './ProjectCard';
import { QuickViewModal } from './QuickViewModal';
import { DEFAULT_PROJECTS } from '../../data/defaultProjects';
import {
  FolderOpen,
  Glasses,
  Camera,
  Search,
  ChevronDown,
  ChevronUp,
  Eye,
  SlidersHorizontal,
  Box,
} from 'lucide-react';

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
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [quickViewProject, setQuickViewProject] = useState<Project | null>(null);
  const [thumbVersion, setThumbVersion] = useState<number>(0);
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

  const categories = useMemo(() => {
    const set = new Set<string>(['Todos']);
    projects.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchCat = selectedCategory === 'Todos' || p.category === selectedCategory;
      const matchQuery =
        searchQuery.trim() === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [projects, selectedCategory, searchQuery]);

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

  const handleUpdateThumbnail = () => {
    setThumbVersion((v) => v + 1);
  };

  return (
    <div
      ref={containerRef}
      key={thumbVersion}
      className="w-full min-h-screen overflow-y-auto bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white"
    >
      {/* Sleek Minimalist Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <Box className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight text-white">
                  XR MODEL VIEWER
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] uppercase font-semibold tracking-wider bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Quest 3S & WebXR
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Visualizador Arquitectónico Espacial
              </p>
            </div>
          </div>

          {/* Quick Actions Right */}
          <div className="flex items-center gap-2">
            {/* Quick AR launch for latest model */}
            <button
              onClick={() => onEnterARProject(latestProject)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-95 text-white px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer shadow-md shadow-emerald-500/20"
              title="Entrar en AR (Cámaras Passthrough) con el módulo más reciente"
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">👓 Entrar en AR</span>
              <span className="sm:hidden">AR</span>
            </button>

            {/* Quick VR launch for latest model */}
            <button
              onClick={() => onEnterVRProject(latestProject)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 text-white px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer shadow-md shadow-cyan-500/20"
              title="Entrar en VR inmersiva"
            >
              <Glasses className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">🥽 Entrar en VR</span>
              <span className="sm:hidden">VR</span>
            </button>

            <button
              onClick={onOpenLocalFileModal}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white px-3 py-2 rounded-xl text-xs font-semibold tracking-wide border border-slate-700/80 transition-all cursor-pointer"
              title="Cargar archivo .glb local"
            >
              <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Cargar .GLB</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex-1 w-full flex flex-col gap-8">
        {/* Minimalist Hero Banner */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-br from-slate-900/90 via-slate-900/50 to-slate-950 p-6 sm:p-8 backdrop-blur-xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/70 border border-slate-700/60 text-slate-300 text-xs font-medium mb-3">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>Módulo destacado: Facultad de Filosofía y Letras</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
                Explora arquitectura en Realidad Mixta
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Coloca maquetas sobre tu mesa real con Passthrough (AR), recorre edificios a escala 1:1 en VR, o captura fotos realistas en 3D para tu catálogo.
              </p>
            </div>

            {/* Quick Hero Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={() => setQuickViewProject(latestProject)}
                className="flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
              >
                <Eye className="w-4 h-4 text-cyan-400" />
                <span>Vista Rápida 360°</span>
              </button>
              <button
                onClick={() => onEnterARProject(latestProject)}
                className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-95 text-white px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer shadow-lg shadow-emerald-500/25"
              >
                <Camera className="w-4 h-4" />
                <span>👓 Entrar en AR</span>
              </button>
              <button
                onClick={() => onSelectProject(latestProject)}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl text-xs font-medium border border-slate-800 transition-all cursor-pointer"
              >
                <span>Ver 3D (PC)</span>
              </button>
            </div>
          </div>
        </section>

        {/* Filter Strip & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 mr-1 shrink-0" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar proyecto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-800 focus:border-cyan-500/60 rounded-xl pl-8.5 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Project Grid */}
        {filteredProjects.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            No se encontraron proyectos en la categoría "{selectedCategory}".
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onSelect={onSelectProject}
                onEnterVR={onEnterVRProject}
                onEnterAR={onEnterARProject}
                onQuickView={(p) => setQuickViewProject(p)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-6 text-center text-xs text-slate-500">
        XR Model Viewer • Inmersión Espacial en Meta Quest 3S & PC
      </footer>

      {/* Interactive Quick View Modal (360 Preview + Snapshot Camera) */}
      <QuickViewModal
        project={quickViewProject}
        isOpen={!!quickViewProject}
        onClose={() => setQuickViewProject(null)}
        onOpenFullViewer={(p) => {
          onSelectProject(p);
          setQuickViewProject(null);
        }}
        onEnterAR={(p) => {
          onEnterARProject(p);
          setQuickViewProject(null);
        }}
        onEnterVR={(p) => {
          onEnterVRProject(p);
          setQuickViewProject(null);
        }}
        onUpdateThumbnail={handleUpdateThumbnail}
      />

      {/* Floating Scroll Buttons for Meta Quest Laser Pointer Navigation */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-2 pointer-events-auto">
        <button
          onClick={scrollUp}
          className="w-11 h-11 rounded-full bg-slate-900/90 border border-slate-700/80 hover:border-cyan-500 text-slate-200 hover:text-white flex items-center justify-center shadow-2xl backdrop-blur-md transition-all active:scale-90 cursor-pointer"
          title="Subir página"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
        <button
          onClick={scrollDown}
          className="w-11 h-11 rounded-full bg-slate-900/90 border border-slate-700/80 hover:border-cyan-500 text-slate-200 hover:text-white flex items-center justify-center shadow-2xl backdrop-blur-md transition-all active:scale-90 cursor-pointer"
          title="Bajar página"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

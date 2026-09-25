import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Project } from '../../types';
import { ProjectCard } from './ProjectCard';
import { UploadCard } from './UploadCard';
import { DEFAULT_PROJECTS } from '../../data/defaultProjects';
import { useDeviceType } from '../../hooks/useDeviceType';
import {
  Glasses,
  Camera,
  Search,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Box,
  Layers,
  X,
  FolderOpen,
  Sun,
  Moon,
} from 'lucide-react';
import type { ThemeMode } from '../../App';

interface ProjectCatalogProps {
  onSelectProject: (project: Project, file?: File) => void;
  onEnterVRProject: (project: Project) => void;
  onEnterARProject: (project: Project) => void;
  onOpenLocalFileModal: () => void;
  theme?: ThemeMode;
  onToggleTheme?: () => void;
}

export const ProjectCatalog: React.FC<ProjectCatalogProps> = ({
  onSelectProject,
  onEnterVRProject,
  onEnterARProject,
  onOpenLocalFileModal,
  theme = 'dark',
  onToggleTheme,
}) => {
  const { isMetaQuest } = useDeviceType();
  const [projects, setProjects] = useState<Project[]>(DEFAULT_PROJECTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState<boolean>(false);

  // Live Clock & Date state
  const [currentTime, setCurrentTime] = useState<string>('12:00');
  const [currentDate, setCurrentDate] = useState<string>('Jue, 19 Sep 2026');

  const containerRef = useRef<HTMLDivElement>(null);
  const deckRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Background URL with Vite base URL support for GitHub Pages
  const baseUrl = import.meta.env.BASE_URL || '/';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const bgImageUrl = `${cleanBase}images/spatial-observatory-bg.jpg`;
  const logoUrl = `${cleanBase}logo.png`;

  // Update clock & date every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);

      const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      const months = [
        'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
        'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
      ];
      const dayName = days[now.getDay()];
      const dayNum = now.getDate();
      const monthName = months[now.getMonth()];
      const year = now.getFullYear();
      setCurrentDate(`${dayName}, ${dayNum} ${monthName} ${year}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch projects from projects.json if available
  useEffect(() => {
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
  }, [baseUrl]);

  // Focus search when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

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
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchQuery;
    });
  }, [projects, selectedCategory, searchQuery]);

  const latestProject = projects[0] || DEFAULT_PROJECTS[0];

  // Scroll horizontal card deck
  const scrollDeck = (direction: 'left' | 'right') => {
    if (deckRef.current) {
      const offset = direction === 'left' ? -350 : 350;
      deckRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Vertical scroll helpers for Quest
  const scrollDown = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ top: 350, behavior: 'smooth' });
    } else {
      window.scrollBy({ top: 350, behavior: 'smooth' });
    }
  };

  const scrollUp = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ top: -350, behavior: 'smooth' });
    } else {
      window.scrollBy({ top: -350, behavior: 'smooth' });
    }
  };

  // Construct spatial card sequence with UploadCard in the center
  const renderDeckItems = () => {
    const items: React.ReactNode[] = [];
    const uploadElement = (
      <UploadCard
        key="upload-center-card"
        onOpenLocalFileModal={onOpenLocalFileModal}
        onFileDrop={(proj, file) => onSelectProject(proj, file)}
      />
    );

    if (filteredProjects.length === 0) {
      return (
        <div className="flex items-center gap-6">
          {uploadElement}
          <div className="flex flex-col items-center justify-center w-72 h-[350px] rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/5 p-6 text-center text-slate-400">
            <p className="text-sm font-medium mb-2">No se encontraron modelos</p>
            <p className="text-xs text-slate-500 mb-4">
              Prueba con otra categoría o limpia la búsqueda.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('Todos');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/30 transition-all cursor-pointer"
            >
              Restablecer filtros
            </button>
          </div>
        </div>
      );
    }

    if (filteredProjects.length <= 2) {
      filteredProjects.forEach((proj) => {
        items.push(
          <ProjectCard
            key={proj.id}
            project={proj}
            onSelect={onSelectProject}
            onEnterVR={onEnterVRProject}
            onEnterAR={onEnterARProject}
            isMetaQuest={isMetaQuest}
          />
        );
      });
      items.push(uploadElement);
      return items;
    }

    // Reference layout: 2 cards to the left, Center Upload Card, remaining cards to the right
    const leftSide = filteredProjects.slice(0, 2);
    const rightSide = filteredProjects.slice(2);

    leftSide.forEach((proj) => {
      items.push(
        <ProjectCard
          key={proj.id}
          project={proj}
          onSelect={onSelectProject}
          onEnterVR={onEnterVRProject}
          onEnterAR={onEnterARProject}
          isMetaQuest={isMetaQuest}
        />
      );
    });

    items.push(uploadElement);

    rightSide.forEach((proj) => {
      items.push(
        <ProjectCard
          key={proj.id}
          project={proj}
          onSelect={onSelectProject}
          onEnterVR={onEnterVRProject}
          onEnterAR={onEnterARProject}
          isMetaQuest={isMetaQuest}
        />
      );
    });

    return items;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-screen overflow-x-hidden overflow-y-auto bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-white"
    >
      {/* 1. Sci-Fi Orbital Observatory Background Layer */}
      <div
        className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `radial-gradient(ellipse at 50% 30%, rgba(15, 23, 42, 0.25) 0%, rgba(2, 6, 23, 0.88) 100%), url(${bgImageUrl})`,
        }}
      />

      {/* Subtle glowing ambient horizon line */}
      <div className="fixed top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent pointer-events-none z-0" />

      {/* 2. Top Header Navigation */}
      <header className="relative z-20 w-full px-6 sm:px-12 py-5 sm:py-6 flex items-start justify-between gap-4">
        {/* Top-Left Branding */}
        <div className="flex items-center gap-3.5">
          <img
            src={logoUrl}
            alt="XR Model Viewer"
            className="h-10 sm:h-12 w-auto object-contain filter drop-shadow-[0_0_18px_rgba(6,182,212,0.45)] transition-transform duration-300 hover:scale-105"
          />
          <span className="hidden md:inline-flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 px-2.5 py-1 rounded-full backdrop-blur-md self-center">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            {isMetaQuest ? 'Quest 3S' : 'Web 3D'}
          </span>
        </div>

        {/* Top-Right Live Clock, Date & Quick Device Action */}
        <div className="flex items-center gap-4 sm:gap-6">
          {isMetaQuest ? (
            /* Meta Quest Direct 1-Click Launchers */
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEnterARProject(latestProject)}
                className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500/90 to-teal-600/90 hover:from-emerald-400 hover:to-teal-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.3)] border border-emerald-400/30 cursor-pointer"
                title="Entrar directo en AR con cámaras Passthrough"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>👓 AR</span>
              </button>

              <button
                onClick={() => onEnterVRProject(latestProject)}
                className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500/90 to-blue-600/90 hover:from-cyan-400 hover:to-blue-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.3)] border border-cyan-400/30 cursor-pointer"
                title="Entrar directo en VR inmersiva"
              >
                <Glasses className="w-3.5 h-3.5" />
                <span>🥽 VR</span>
              </button>
            </div>
          ) : (
            /* PC: Clean upload button & Theme Toggle */
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={onOpenLocalFileModal}
                className="flex items-center gap-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide border border-slate-700/80 hover:border-cyan-400/50 transition-all active:scale-95 cursor-pointer shadow-sm"
                title="Cargar archivo .glb o .gltf propio"
              >
                <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
                <span>+ Cargar .GLB</span>
              </button>

              {onToggleTheme && (
                <button
                  onClick={onToggleTheme}
                  className="flex items-center gap-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide border border-slate-700/80 hover:border-amber-400/50 transition-all active:scale-95 cursor-pointer shadow-sm"
                  title={theme === 'dark' ? 'Cambiar a Modo Claro ☀️' : 'Cambiar a Modo Oscuro 🌙'}
                >
                  {theme === 'dark' ? (
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  )}
                  <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}</span>
                </button>
              )}
            </div>
          )}

          {/* Clock & Tagline Block */}
          <div className="flex flex-col items-end text-right">
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
                {currentTime}
              </span>
              <span className="text-xs text-slate-300 font-medium">
                {currentDate}
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.25em] text-cyan-400/90 uppercase">
              IDEAS EN OTRA DIMENSIÓN
            </span>
          </div>
        </div>
      </header>

      {/* 3. Hero Typography Area */}
      <section className="relative z-10 px-6 sm:px-14 pt-2 sm:pt-4 pb-2">
        <div className="max-w-2xl flex flex-col items-start">
          {/* Accent Dash */}
          <div className="w-8 h-1 bg-cyan-400 rounded-full mb-3 shadow-[0_0_10px_#22d3ee]" />

          {/* Hero Heading matching reference */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight mb-2 drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
            Modelos 3D sin límites
          </h1>

          {/* Hero Subtitle */}
          <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed max-w-xl font-normal drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
            {isMetaQuest
              ? 'Explora proyectos arquitectónicos interactivos, maquetas en realidad mixta (AR) y visualizaciones inmersivas (VR) con Meta Quest 3S.'
              : 'Explora proyectos arquitectónicos interactivos, examina maquetas en 3D y visualiza a escala real desde tu navegador.'}
          </p>

          {/* Direct Start in XR Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 mt-4">
            {isMetaQuest ? (
              <>
                <button
                  onClick={() => onEnterARProject(latestProject)}
                  className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold tracking-wide shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all active:scale-95 cursor-pointer border border-emerald-400/40"
                  title="Entrar a la experiencia en Realidad Aumentada con cámaras Passthrough"
                >
                  <Camera className="w-4 h-4" />
                  <span>👓 Iniciar en AR (Mesa real)</span>
                </button>

                <button
                  onClick={() => onEnterVRProject(latestProject)}
                  className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold tracking-wide shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all active:scale-95 cursor-pointer border border-cyan-400/40"
                  title="Entrar a la experiencia en Realidad Virtual inmersiva"
                >
                  <Glasses className="w-4 h-4" />
                  <span>🥽 Iniciar en VR (Inmersivo)</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onSelectProject(latestProject)}
                  className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-5 py-2.5 rounded-2xl text-xs font-bold tracking-wide shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all active:scale-95 cursor-pointer border border-cyan-400/40"
                >
                  <Box className="w-4 h-4" />
                  <span>Explorar en 3D (PC)</span>
                </button>
                <button
                  onClick={onOpenLocalFileModal}
                  className="flex items-center gap-2 bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white px-4 py-2.5 rounded-2xl text-xs font-semibold tracking-wide border border-slate-700/80 transition-all active:scale-95 cursor-pointer"
                >
                  <FolderOpen className="w-4 h-4 text-cyan-400" />
                  <span>+ Cargar modelo local</span>
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 4. Horizontal Spatial Floating Card Deck */}
      <section className="relative z-10 w-full my-auto py-4 sm:py-6">
        {/* Navigation Chevron Left */}
        <button
          onClick={() => scrollDeck('left')}
          className="hidden sm:flex absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-slate-900/70 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 border border-white/10 hover:border-cyan-400 items-center justify-center backdrop-blur-xl shadow-[0_10px_25px_rgba(0,0,0,0.6)] transition-all active:scale-90 cursor-pointer"
          title="Desplazar a la izquierda"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Navigation Chevron Right */}
        <button
          onClick={() => scrollDeck('right')}
          className="hidden sm:flex absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-slate-900/70 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 border border-white/10 hover:border-cyan-400 items-center justify-center backdrop-blur-xl shadow-[0_10px_25px_rgba(0,0,0,0.6)] transition-all active:scale-90 cursor-pointer"
          title="Desplazar a la derecha"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Scrollable Card Track */}
        <div
          ref={deckRef}
          onWheel={(e) => {
            if (deckRef.current && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
              deckRef.current.scrollBy({ left: e.deltaY * 0.8, behavior: 'auto' });
            }
          }}
          className="w-full flex items-center gap-6 sm:gap-7 overflow-x-auto px-6 sm:px-20 py-6 no-scrollbar scroll-smooth"
        >
          {renderDeckItems()}
        </div>
      </section>

      {/* 5. Floating Pill Dock: [ 🔍 Explorar modelos | ⊞ Categorías ] */}
      <section className="relative z-20 flex flex-col items-center justify-center px-4 pb-4">
        {/* Interactive Search Expandable Bar */}
        {isSearchOpen && (
          <div className="mb-3 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            <div className="relative flex items-center bg-slate-900/90 backdrop-blur-2xl border border-cyan-400/50 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.25)] px-3.5 py-2">
              <Search className="w-4 h-4 text-cyan-400 mr-2 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre o descripción..."
                className="w-full bg-transparent text-xs text-white placeholder-slate-400 outline-none"
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-slate-400 hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="text-slate-400 hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Interactive Categories Expandable Popover */}
        {isCategoriesOpen && (
          <div className="mb-3 flex flex-wrap items-center justify-center gap-1.5 p-2 bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in-95 duration-200 max-w-lg">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setIsCategoriesOpen(false);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* The Sleek Floating Dock Pill */}
        <div className="flex items-center bg-slate-900/80 hover:bg-slate-900/95 backdrop-blur-2xl border border-white/10 hover:border-cyan-400/40 rounded-full px-5 py-2.5 shadow-[0_15px_40px_rgba(0,0,0,0.6)] transition-all duration-300">
          {/* Button 1: Explorar modelos / Buscar */}
          <button
            onClick={() => {
              setIsSearchOpen((prev) => !prev);
              setIsCategoriesOpen(false);
            }}
            className="flex items-center gap-2 text-xs font-semibold text-slate-200 hover:text-cyan-300 transition-colors px-2 py-1 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              {searchQuery ? `Filtro: "${searchQuery}"` : 'Explorar modelos'}
            </span>
          </button>

          {/* Vertical Divider */}
          <div className="w-px h-4 bg-white/20 mx-3" />

          {/* Button 2: Categorías */}
          <button
            onClick={() => {
              setIsCategoriesOpen((prev) => !prev);
              setIsSearchOpen(false);
            }}
            className="flex items-center gap-2 text-xs font-semibold text-slate-200 hover:text-cyan-300 transition-colors px-2 py-1 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              {selectedCategory === 'Todos' ? 'Categorías' : selectedCategory}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                isCategoriesOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </section>

      {/* 6. Institutional Bottom Footer */}
      <footer className="relative z-10 w-full px-6 sm:px-12 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-white/[0.04]">
        {/* Left Branding */}
        <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.25em] text-slate-400/90 uppercase">
          UNAM · PC PUMA · VXR LABS
        </span>

        {/* Center Hint */}
        <span className="text-[10px] text-slate-500 font-medium hidden md:inline">
          {isMetaQuest
            ? 'Presiona [Y] en tu control Meta Quest para abrir/cerrar el menú espacial en VR'
            : 'Usa el ratón para rotar en 360°, la rueda para zoom y clic para explorar maquetas'}
        </span>

        {/* Right Branding */}
        <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.25em] text-cyan-400/90 uppercase">
          REAL MODELS · REAL EXPERIENCES
        </span>
      </footer>

      {/* Floating Scroll Buttons for Meta Quest Laser Pointer Navigation */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-2 pointer-events-auto">
        <button
          onClick={scrollUp}
          className="w-10 h-10 rounded-full bg-slate-900/80 border border-slate-700/80 hover:border-cyan-500 text-slate-300 hover:text-white flex items-center justify-center shadow-2xl backdrop-blur-md transition-all active:scale-90 cursor-pointer"
          title="Subir vista"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <button
          onClick={scrollDown}
          className="w-10 h-10 rounded-full bg-slate-900/80 border border-slate-700/80 hover:border-cyan-500 text-slate-300 hover:text-white flex items-center justify-center shadow-2xl backdrop-blur-md transition-all active:scale-90 cursor-pointer"
          title="Bajar vista"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};


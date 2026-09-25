import React from 'react';
import type { Project } from '../../types';
import { ArrowRight, Glasses, Camera, Box } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onSelect: (project: Project) => void;
  onEnterVR?: (project: Project) => void;
  onEnterAR?: (project: Project) => void;
  onQuickView?: (project: Project) => void;
  isMetaQuest?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onSelect,
  onEnterVR,
  onEnterAR,
  isMetaQuest = false,
}) => {
  const getCleanThumbnailUrl = (thumb: string) => {
    if (!thumb) return '';
    if (
      thumb.startsWith('http://') ||
      thumb.startsWith('https://') ||
      thumb.startsWith('blob:') ||
      thumb.startsWith('data:')
    ) {
      return thumb;
    }
    const base = import.meta.env.BASE_URL || '/';
    const cleanBase = base.endsWith('/') ? base : `${base}/`;
    const cleanPath = thumb.startsWith('/') ? thumb.slice(1) : thumb;
    return `${cleanBase}${cleanPath}`;
  };

  const getInitialSrc = () => {
    try {
      const custom = localStorage.getItem(`custom_thumb_${project.id}`);
      if (custom) return custom;
    } catch (_) {}
    return getCleanThumbnailUrl(project.thumbnail);
  };

  const [imgSrc, setImgSrc] = React.useState<string>(getInitialSrc);
  const [hasError, setHasError] = React.useState<boolean>(false);

  React.useEffect(() => {
    setImgSrc(getInitialSrc());
    setHasError(false);
  }, [project.id, project.thumbnail]);

  const handleImageError = () => {
    const defaultUrl = getCleanThumbnailUrl(project.thumbnail);
    // If custom thumbnail failed, fallback to default project thumbnail
    if (imgSrc !== defaultUrl && defaultUrl) {
      setImgSrc(defaultUrl);
    } else {
      setHasError(true);
    }
  };

  // Dynamic badge according to category
  const badgeLabel = isMetaQuest
    ? (project.category === 'Académico' ? 'AR' : project.category === 'Residencial' ? 'VR' : 'AR / VR')
    : (project.category || 'Modelo 3D');
  const displayTitle = project.name;

  return (
    <div
      id={`card-${project.id}`}
      onClick={() => onSelect(project)}
      className="group relative flex flex-col justify-between w-64 sm:w-72 h-[340px] sm:h-[370px] rounded-3xl bg-slate-900/40 hover:bg-slate-900/60 backdrop-blur-2xl border border-white/[0.08] hover:border-cyan-400/80 shadow-[0_20px_50px_rgba(0,0,0,0.6)] hover:shadow-[0_0_35px_rgba(6,182,212,0.3)] transition-all duration-500 hover:-translate-y-2 cursor-pointer overflow-hidden p-5 shrink-0 select-none"
    >
      {/* Subtle glass reflection gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] via-transparent to-black/40 pointer-events-none" />

      {/* Top Header Row with Category Badge */}
      <div className="relative z-10 flex items-center justify-between">
        <span className="px-3.5 py-1 rounded-full bg-slate-950/60 border border-white/10 text-[11px] font-bold tracking-wider text-slate-200 uppercase backdrop-blur-md shadow-sm">
          {badgeLabel}
        </span>
        <div className="w-2 h-2 rounded-full bg-cyan-400/60 group-hover:bg-cyan-400 group-hover:shadow-[0_0_8px_#22d3ee] transition-all" />
      </div>

      {/* Center 3D Model Render */}
      <div className="relative z-10 my-auto flex items-center justify-center aspect-[16/11] w-full overflow-hidden rounded-2xl bg-slate-950/40 border border-white/[0.04]">
        {!hasError && imgSrc ? (
          <img
            src={imgSrc}
            alt={project.name}
            className="w-full h-full object-contain filter drop-shadow-[0_15px_20px_rgba(0,0,0,0.7)] transition-transform duration-700 group-hover:scale-108"
            onError={handleImageError}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 p-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <Box className="w-6 h-6 stroke-[2]" />
            </div>
            <span className="text-[11px] font-medium text-slate-400">
              Modelo 3D Interactivo
            </span>
          </div>
        )}

        {/* Action Overlay: Tailored for Device */}
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2 p-4">
          {isMetaQuest ? (
            /* Meta Quest laser-friendly direct buttons */
            <div className="flex flex-col gap-2 w-full">
              {onEnterAR && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEnterAR(project);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                  title="Colocar en tu mesa con cámaras Passthrough"
                >
                  <Camera className="w-4 h-4" />
                  <span>👓 Ver en AR (Mesa)</span>
                </button>
              )}
              {onEnterVR && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEnterVR(project);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                  title="Entrar en Realidad Virtual inmersiva"
                >
                  <Glasses className="w-4 h-4" />
                  <span>🥽 Ver en VR</span>
                </button>
              )}
            </div>
          ) : (
            /* PC & Mobile: Single direct button to open 3D viewer */
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(project);
              }}
              className="w-full max-w-[190px] flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs sm:text-sm font-bold py-3 rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.45)] transition-all active:scale-95 cursor-pointer"
            >
              <Box className="w-4 h-4" />
              <span>Abrir Visor 3D</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Label & Arrow Row */}
      <div className="relative z-10 pt-3 border-t border-white/[0.06] flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-white tracking-tight group-hover:text-cyan-300 transition-colors">
            {displayTitle}
          </h4>
          <p className="text-[11px] text-slate-400 font-medium truncate max-w-[190px]">
            {project.description || project.category}
          </p>
        </div>

        <div className="w-8 h-8 rounded-full bg-white/[0.04] group-hover:bg-cyan-500 text-slate-400 group-hover:text-slate-950 flex items-center justify-center transition-all duration-300 shadow-sm shrink-0">
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import type { Project } from '../../types';
import { ArrowRight, Box, Glasses, Camera, Eye } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onSelect: (project: Project) => void;
  onEnterVR?: (project: Project) => void;
  onEnterAR?: (project: Project) => void;
  onQuickView?: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onSelect,
  onEnterVR,
  onEnterAR,
  onQuickView,
}) => {
  const baseUrl = import.meta.env.BASE_URL || '/';

  // Check if user has taken a custom snapshot for this project
  let customThumb: string | null = null;
  try {
    customThumb = localStorage.getItem(`custom_thumb_${project.id}`);
  } catch (_) {}

  const resolvedThumbnail =
    customThumb ||
    (project.thumbnail.startsWith('http') || project.thumbnail.startsWith('blob:') || project.thumbnail.startsWith('data:')
      ? project.thumbnail
      : `${baseUrl}${project.thumbnail.startsWith('/') ? project.thumbnail.slice(1) : project.thumbnail}`);

  return (
    <div
      id={`card-${project.id}`}
      className="group bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/40 rounded-3xl overflow-hidden shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/10 flex flex-col scroll-mt-24"
    >
      {/* Thumbnail with Quick View Hover Overlay */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
        <img
          src={resolvedThumbnail}
          alt={project.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <div className="bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-700/60 flex items-center gap-1.5 text-[11px] text-cyan-300 font-medium">
            <Box className="w-3.5 h-3.5 text-cyan-400" />
            <span>GLB 3D</span>
          </div>
          {project.category && (
            <span className="bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-700/60 text-[11px] text-slate-300 font-medium">
              {project.category}
            </span>
          )}
        </div>

        {/* Quick View Button (hover reveal & mobile accessible) */}
        {onQuickView && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(project);
            }}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-slate-900/90 hover:bg-cyan-600 active:scale-95 text-slate-200 hover:text-white px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md border border-slate-700/80 hover:border-cyan-500 transition-all cursor-pointer shadow-lg"
            title="Abrir vista rápida interactiva 360°"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400 group-hover:text-white" />
            <span>Vista Rápida 360°</span>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 justify-between gap-4">
        <div>
          <h3
            onClick={() => onSelect(project)}
            className="text-base font-bold text-white tracking-tight group-hover:text-cyan-400 transition-colors cursor-pointer"
          >
            {project.name}
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Action Buttons for Meta Quest and PC */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
          {/* Direct AR Entry Button */}
          {onEnterAR && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEnterAR(project);
              }}
              className="flex-1 flex items-center justify-center gap-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-95 text-white py-2 px-2.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer shadow-md shadow-emerald-500/20"
              title="Entrar en Realidad Aumentada con cámara Passthrough"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>AR</span>
            </button>
          )}

          {/* Direct VR Entry Button */}
          {onEnterVR && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEnterVR(project);
              }}
              className="flex-1 flex items-center justify-center gap-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 text-white py-2 px-2.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer shadow-md shadow-cyan-500/20"
              title="Entrar en Realidad Virtual inmersiva"
            >
              <Glasses className="w-3.5 h-3.5" />
              <span>VR</span>
            </button>
          )}

          {/* Open 3D Viewer Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(project);
            }}
            className="flex-1 flex items-center justify-center gap-1 bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white py-2 px-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer border border-slate-700/60"
            title="Abrir en visor 3D para PC"
          >
            <span>3D PC</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

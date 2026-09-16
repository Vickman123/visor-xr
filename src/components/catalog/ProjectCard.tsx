import React from 'react';
import type { Project } from '../../types';
import { ArrowRight, Box, Glasses, Camera } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onSelect: (project: Project) => void;
  onEnterVR?: (project: Project) => void;
  onEnterAR?: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onSelect,
  onEnterVR,
  onEnterAR,
}) => {
  const baseUrl = import.meta.env.BASE_URL || '/';
  const resolvedThumbnail =
    project.thumbnail.startsWith('http') || project.thumbnail.startsWith('blob:')
      ? project.thumbnail
      : `${baseUrl}${project.thumbnail.startsWith('/') ? project.thumbnail.slice(1) : project.thumbnail}`;

  return (
    <div
      id={`card-${project.id}`}
      className="group bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 rounded-3xl overflow-hidden shadow-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-cyan-500/10 flex flex-col scroll-mt-24"
    >
      {/* Thumbnail */}
      <div
        onClick={() => onSelect(project)}
        className="relative aspect-[16/10] overflow-hidden bg-slate-950 cursor-pointer"
      >
        <img
          src={resolvedThumbnail}
          alt={project.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
        <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700/50 flex items-center gap-1.5 text-xs text-cyan-300 font-medium">
          <Box className="w-3.5 h-3.5 text-cyan-400" />
          <span>GLB 3D</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1 justify-between gap-5">
        <div>
          <h3
            onClick={() => onSelect(project)}
            className="text-lg font-bold text-white tracking-tight group-hover:text-cyan-400 transition-colors cursor-pointer"
          >
            {project.name}
          </h3>
          <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Action Buttons for Meta Quest and PC */}
        <div className="flex flex-col sm:flex-row items-stretch gap-2 pt-2 border-t border-slate-800/80">
          {/* Direct AR Entry Button */}
          {onEnterAR && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEnterAR(project);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-95 text-white py-2.5 px-3 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer shadow-md shadow-emerald-500/20"
              title="Entrar en Realidad Aumentada (Passthrough de Meta Quest 3S)"
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
              className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 text-white py-2.5 px-3 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer shadow-md shadow-cyan-500/20"
              title="Entrar directamente en VR inmersiva"
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
            className="flex-1 flex items-center justify-center gap-1 bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white py-2.5 px-3 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer border border-slate-700/60"
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

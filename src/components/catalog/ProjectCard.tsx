import React from 'react';
import type { Project } from '../../types';
import { ArrowRight, Box } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onSelect: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect }) => {
  const baseUrl = import.meta.env.BASE_URL || '/';
  const resolvedThumbnail = project.thumbnail.startsWith('http') || project.thumbnail.startsWith('blob:')
    ? project.thumbnail
    : `${baseUrl}${project.thumbnail.startsWith('/') ? project.thumbnail.slice(1) : project.thumbnail}`;

  return (
    <div
      onClick={() => onSelect(project)}
      className="group bg-slate-900/70 border border-slate-800 hover:border-cyan-500/50 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-cyan-500/10 flex flex-col cursor-pointer active:scale-[0.99] focus-within:ring-2 focus-within:ring-cyan-400"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
        <img
          src={resolvedThumbnail}
          alt={project.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            // Fallback placeholder if image fails to render
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/50 flex items-center gap-1.5 text-[11px] text-cyan-300 font-medium">
          <Box className="w-3.5 h-3.5 text-cyan-400" />
          <span>GLB 3D</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-cyan-400 transition-colors">
            {project.name}
          </h3>
          <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(project);
          }}
          className="mt-5 w-full flex items-center justify-center gap-2 bg-slate-800 group-hover:bg-cyan-600 text-slate-200 group-hover:text-white py-3 px-5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer shadow-md"
        >
          <span>Abrir proyecto</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};

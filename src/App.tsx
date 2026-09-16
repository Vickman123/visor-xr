import React, { useState } from 'react';
import type { Project } from './types';
import { ProjectCatalog } from './components/catalog/ProjectCatalog';
import { DesktopViewer } from './components/desktop/DesktopViewer';
import { LocalFileModal } from './components/catalog/LocalFileModal';

export const App: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [isLocalModalOpen, setIsLocalModalOpen] = useState(false);

  const handleSelectProject = (project: Project, file?: File) => {
    setSelectedProject(project);
    setLocalFile(file || null);
  };

  const handleBackToCatalog = () => {
    setSelectedProject(null);
    setLocalFile(null);
  };

  const handleLocalFileSelect = (project: Project, file: File) => {
    setSelectedProject(project);
    setLocalFile(file);
  };

  return (
    <div className="w-full h-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      {selectedProject ? (
        <DesktopViewer
          project={selectedProject}
          localFile={localFile}
          onBackToCatalog={handleBackToCatalog}
          onOpenLocalFileModal={() => setIsLocalModalOpen(true)}
        />
      ) : (
        <ProjectCatalog
          onSelectProject={handleSelectProject}
          onOpenLocalFileModal={() => setIsLocalModalOpen(true)}
        />
      )}

      {/* Independent Local File Selector Modal */}
      <LocalFileModal
        isOpen={isLocalModalOpen}
        onClose={() => setIsLocalModalOpen(false)}
        onFileSelect={handleLocalFileSelect}
      />
    </div>
  );
};

export default App;

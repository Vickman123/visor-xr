import React, { useState } from 'react';
import type { Project } from './types';
import { DEFAULT_PROJECTS } from './data/defaultProjects';
import { ProjectCatalog } from './components/catalog/ProjectCatalog';
import { DesktopViewer } from './components/desktop/DesktopViewer';
import { LocalFileModal } from './components/catalog/LocalFileModal';
import { xrStore } from './components/xr/xrStore';

export const App: React.FC = () => {
  const [activeProject, setActiveProject] = useState<Project>(DEFAULT_PROJECTS[0]);
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [isCatalogOpen, setIsCatalogOpen] = useState(true);
  const [isLocalModalOpen, setIsLocalModalOpen] = useState(false);

  // Open in 3D desktop view
  const handleSelectProject = (project: Project, file?: File) => {
    setActiveProject(project);
    setLocalFile(file || null);
    setIsCatalogOpen(false);
  };

  // Direct 1-click WebXR trigger for Meta Quest
  const handleEnterVRProject = async (project: Project) => {
    setActiveProject(project);
    setLocalFile(null);
    setIsCatalogOpen(false);
    try {
      await xrStore.enterVR();
    } catch (err) {
      console.warn('Error launching WebXR session:', err);
    }
  };

  const handleBackToCatalog = () => {
    setIsCatalogOpen(true);
  };

  const handleLocalFileSelect = (project: Project, file: File) => {
    setActiveProject(project);
    setLocalFile(file);
    setIsCatalogOpen(false);
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 font-sans text-slate-100 relative">
      {/* 3D Canvas Viewport (Permanently active so WebXR is always primed and ready) */}
      <div className={`fixed inset-0 ${isCatalogOpen ? 'opacity-0 pointer-events-none' : 'opacity-100 z-10'}`}>
        <DesktopViewer
          project={activeProject}
          localFile={localFile}
          onBackToCatalog={handleBackToCatalog}
          onOpenLocalFileModal={() => setIsLocalModalOpen(true)}
        />
      </div>

      {/* Catalog Screen (Scrollable, with Meta Quest laser navigation & direct VR buttons) */}
      {isCatalogOpen && (
        <div className="relative z-20 w-full min-h-screen overflow-y-auto">
          <ProjectCatalog
            onSelectProject={handleSelectProject}
            onEnterVRProject={handleEnterVRProject}
            onOpenLocalFileModal={() => setIsLocalModalOpen(true)}
          />
        </div>
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

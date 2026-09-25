import React, { useState, useEffect } from 'react';
import type { Project } from './types';
import { ProjectCatalog } from './components/catalog/ProjectCatalog';
import { DesktopViewer } from './components/desktop/DesktopViewer';
import { LocalFileModal } from './components/catalog/LocalFileModal';
import { xrStore } from './components/xr/xrStore';
import { DEFAULT_PROJECTS } from './data/defaultProjects';

export type ThemeMode = 'dark' | 'light';

export const App: React.FC = () => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem('visor_theme_mode') as ThemeMode) || 'dark';
  });
  const [projects, setProjects] = useState<Project[]>(DEFAULT_PROJECTS);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [isCatalogOpen, setIsCatalogOpen] = useState(true);
  const [isLocalModalOpen, setIsLocalModalOpen] = useState(false);
  const [catalogKey, setCatalogKey] = useState(0);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('visor_theme_mode', next);
      return next;
    });
  };

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

  // Open in 3D desktop view
  const handleSelectProject = (project: Project, file?: File) => {
    setActiveProject(project);
    setLocalFile(file || null);
    setIsCatalogOpen(false);
  };

  // Direct 1-click WebXR trigger for Meta Quest VR
  const handleEnterVRProject = async (project: Project) => {
    setActiveProject(project);
    setLocalFile(null);
    setIsCatalogOpen(false);
    try {
      await xrStore.enterVR();
    } catch (err) {
      console.warn('Error launching WebXR VR session:', err);
    }
  };

  // Direct 1-click WebXR AR trigger (Passthrough cameras) for Meta Quest
  const handleEnterARProject = async (project: Project) => {
    setActiveProject(project);
    setLocalFile(null);
    setIsCatalogOpen(false);
    try {
      await xrStore.enterAR();
    } catch (err) {
      console.warn('Error launching WebXR AR session:', err);
    }
  };

  const handleBackToCatalog = () => {
    setIsCatalogOpen(true);
    setActiveProject(null);
    setLocalFile(null);
  };

  const handleLocalFileSelect = (project: Project, file: File) => {
    setActiveProject(project);
    setLocalFile(file);
    setIsCatalogOpen(false);
  };

  const handleUpdateThumbnail = () => {
    setCatalogKey((k) => k + 1);
  };

  return (
    <div className={`w-full min-h-screen font-sans transition-colors duration-300 ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      {/* Catalog View - Lightweight, fast, full scrolling with zero 3D overhead */}
      {isCatalogOpen ? (
        <div key={catalogKey} className="w-full min-h-screen overflow-y-auto">
          <ProjectCatalog
            onSelectProject={handleSelectProject}
            onEnterVRProject={handleEnterVRProject}
            onEnterARProject={handleEnterARProject}
            onOpenLocalFileModal={() => setIsLocalModalOpen(true)}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        </div>
      ) : activeProject ? (
        /* 3D Viewport - Only loads model and runs WebGL when project is chosen */
        <div className={`fixed inset-0 overflow-hidden z-10 ${
          theme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'
        }`}>
          <DesktopViewer
            project={activeProject}
            projects={projects}
            onSelectProject={(p) => {
              setActiveProject(p);
              setLocalFile(null);
            }}
            localFile={localFile}
            onBackToCatalog={handleBackToCatalog}
            onOpenLocalFileModal={() => setIsLocalModalOpen(true)}
            onUpdateThumbnail={handleUpdateThumbnail}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        </div>
      ) : null}

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

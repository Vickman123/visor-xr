import {
  Folder,
  Box,
  Search,
  RefreshCw,
  LogOut,
  X,
  ChevronRight,
  ExternalLink,
  HardDrive,
  AlertCircle,
} from 'lucide-react';
import { useGoogleDrive } from '../../hooks/useGoogleDrive';
import { driveService, type DriveModel } from '../../services/driveService';
import type { Project } from '../../types';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDriveModel: (project: Project) => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  onSelectDriveModel,
}) => {
  const {
    isAuthenticated,
    currentUser,
    isCheckingAuth,
    folders,
    models,
    breadcrumbs,
    isLoadingContent,
    searchQuery,
    setSearchQuery,
    error,
    loginWithGoogle,
    logout,
    navigateToFolder,
    navigateToBreadcrumb,
    refresh,
  } = useGoogleDrive();

  if (!isOpen) return null;

  const handleSelectModel = (model: DriveModel) => {
    const streamUrl = driveService.getStreamUrl(model.id);

    // Create synthetic Project object to feed into Visor XR's useModelLoader
    const driveProject: Project = {
      id: `gdrive_${model.id}`,
      name: model.name.replace(/\.glb$/i, ''),
      description: `Modelo cargado desde Google Drive • Tamaño: ${model.sizeFormatted}`,
      model: streamUrl,
      thumbnail: model.thumbnailLink || '/favicon.png',
      category: 'Google Drive',
    };

    onSelectDriveModel(driveProject);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900/95 border border-cyan-500/30 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.2)] flex flex-col overflow-hidden text-slate-100">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/50">
          <div className="flex items-center gap-3">
            {/* Google Drive Color Icon */}
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <HardDrive className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-wide text-white uppercase">
                  Google Drive 3D
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full">
                  Modelos .GLB
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Accede a tus proyectos arquitectónicos en la nube
              </span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated && currentUser && (
              <div className="hidden sm:flex items-center gap-2 bg-slate-800/80 border border-white/10 rounded-2xl px-3 py-1.5">
                {currentUser.picture ? (
                  <img
                    src={currentUser.picture}
                    alt={currentUser.name || 'User'}
                    className="w-5 h-5 rounded-full object-cover border border-cyan-400/40"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold flex items-center justify-center">
                    {currentUser.name ? currentUser.name[0] : 'U'}
                  </div>
                )}
                <span className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">
                  {currentUser.name || currentUser.email}
                </span>
                <button
                  onClick={logout}
                  className="text-slate-400 hover:text-red-400 p-1 transition-colors cursor-pointer"
                  title="Cerrar sesión de Google Drive"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {isCheckingAuth ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
            <span className="text-sm font-semibold">Verificando sesión de Google...</span>
          </div>
        ) : !isAuthenticated ? (
          /* Unauthenticated State: Login Screen */
          <div className="flex flex-col items-center justify-center p-8 sm:p-14 text-center my-auto">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-[0_0_35px_rgba(6,182,212,0.35)] mb-6 animate-pulse">
              <HardDrive className="w-10 h-10" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
              Conecta tu Google Drive
            </h2>
            <p className="text-xs sm:text-sm text-slate-300/90 max-w-lg mb-8 leading-relaxed">
              Inicia sesión con tu cuenta de Google para explorar tus carpetas y visualizar tus modelos arquitectónicos en formato <strong className="text-cyan-400 font-semibold">.GLB</strong> directamente en Web, Móvil y Meta Quest.
            </p>

            {error && (
              <div className="mb-6 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2 max-w-md">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={loginWithGoogle}
              className="flex items-center gap-3 bg-white hover:bg-slate-100 text-slate-900 font-bold px-6 py-3.5 rounded-2xl shadow-xl hover:shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer text-sm"
            >
              {/* Google G Logo SVG */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Acceder con Google</span>
            </button>

            <span className="text-[11px] text-slate-500 mt-4">
              Solo se solicitarán permisos de lectura (drive.readonly) para tus archivos 3D.
            </span>
          </div>
        ) : (
          /* Authenticated State: Explorer Interface */
          <div className="flex flex-col flex-1 min-h-0">
            {/* Breadcrumb Navigation Bar & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-6 py-3 border-b border-white/5 bg-slate-950/30">
              {/* Breadcrumbs */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar py-1">
                {breadcrumbs.map((crumb, idx) => {
                  const isLast = idx === breadcrumbs.length - 1;
                  return (
                    <div key={crumb.id} className="flex items-center gap-1.5 shrink-0">
                      {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                      <button
                        onClick={() => navigateToBreadcrumb(idx)}
                        className={`px-2.5 py-1 rounded-xl font-medium transition-colors cursor-pointer ${
                          isLast
                            ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        {idx === 0 ? '📁 ' + crumb.name : crumb.name}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Search & Refresh */}
              <div className="flex items-center gap-2">
                <div className="relative flex items-center bg-slate-950/80 border border-white/10 rounded-xl px-3 py-1.5 w-full sm:w-60 focus-within:border-cyan-400/50 transition-colors">
                  <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar .glb en Drive..."
                    className="w-full bg-transparent text-xs text-white placeholder-slate-500 outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  onClick={refresh}
                  className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10 shrink-0"
                  title="Actualizar contenido"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingContent ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Main Browsing Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {isLoadingContent ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                  <RefreshCw className="w-7 h-7 animate-spin text-cyan-400" />
                  <span className="text-xs font-semibold">Cargando contenido de Google Drive...</span>
                </div>
              ) : (
                <>
                  {/* Folders Section (Only shown when not searching) */}
                  {!searchQuery && folders.length > 0 && (
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
                        Carpetas ({folders.length})
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {folders.map((folder) => (
                          <button
                            key={folder.id}
                            onClick={() => navigateToFolder(folder.id, folder.name)}
                            className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-white/5 hover:border-cyan-500/40 text-left transition-all active:scale-95 group cursor-pointer"
                          >
                            <Folder className="w-5 h-5 text-amber-400 group-hover:text-amber-300 shrink-0 transition-colors" />
                            <span className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                              {folder.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3D Models (.glb) Section */}
                  <div>
                    <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block mb-3">
                      Modelos 3D .GLB Disponibles ({models.length})
                    </span>

                    {models.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-3xl bg-slate-950/40 border border-white/5">
                        <Box className="w-12 h-12 text-slate-600 mb-3 stroke-[1.5]" />
                        <span className="text-sm font-bold text-slate-300 mb-1">
                          {searchQuery
                            ? 'No se encontraron modelos con esa búsqueda'
                            : 'No hay modelos .GLB en esta carpeta'}
                        </span>
                        <p className="text-xs text-slate-500 max-w-md">
                          Sube tus archivos de arquitectura o ingeniería en formato <strong>.glb</strong> a esta carpeta de Google Drive y presiona el botón actualizar.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {models.map((model) => (
                          <div
                            key={model.id}
                            className="group relative flex flex-col justify-between p-4 rounded-3xl bg-slate-800/50 hover:bg-slate-800/90 border border-white/10 hover:border-cyan-400/50 shadow-lg hover:shadow-cyan-500/10 transition-all duration-300"
                          >
                            {/* Card Top Icon & Size */}
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                                <Box className="w-5 h-5 stroke-[2]" />
                              </div>
                              <span className="text-[10px] font-mono font-bold bg-slate-900/90 text-cyan-300 px-2 py-1 rounded-xl border border-white/10">
                                {model.sizeFormatted}
                              </span>
                            </div>

                            {/* Model Name & Date */}
                            <div className="mb-4">
                              <h3 className="text-xs font-bold text-white group-hover:text-cyan-300 truncate transition-colors" title={model.name}>
                                {model.name}
                              </h3>
                              <span className="text-[10px] text-slate-400 block mt-1">
                                {model.modifiedTime ? new Date(model.modifiedTime).toLocaleDateString() : ''}
                              </span>
                            </div>

                            {/* Open Action Button */}
                            <button
                              onClick={() => handleSelectModel(model)}
                              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Abrir en Visor 3D</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/5 bg-slate-950/70 flex items-center justify-between text-[11px] text-slate-500">
          <span>Microservicio Google Drive API v3</span>
          <span className="text-cyan-400/80 font-medium">Soporte para PC, Móvil y Meta Quest 3S</span>
        </div>
      </div>
    </div>
  );
};

import { useState, useEffect, useCallback } from 'react';
import { driveService, type DriveUser, type DriveFolder, type DriveModel } from '../services/driveService';

export interface BreadcrumbItem {
  id: string;
  name: string;
}

export function useGoogleDrive() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<DriveUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  // Navigation & folder hierarchy
  const [currentFolderId, setCurrentFolderId] = useState<string>('root');
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { id: 'root', name: 'Mi Unidad' },
  ]);
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [models, setModels] = useState<DriveModel[]>([]);
  const [isLoadingContent, setIsLoadingContent] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Check URL query parameters for OAuth redirect callback token
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    const token = url.searchParams.get('token');
    const authSuccess = url.searchParams.get('gdrive_auth');

    if (token) {
      driveService.setStoredToken(token);
      // Clean query params from URL without refreshing
      url.searchParams.delete('token');
      url.searchParams.delete('gdrive_auth');
      window.history.replaceState({}, document.title, url.pathname + url.search);
    }

    if (authSuccess === 'success' || token) {
      checkAuth();
    }
  }, []);

  const checkAuth = useCallback(async () => {
    setIsCheckingAuth(true);
    setError(null);
    try {
      const res = await driveService.checkAuthStatus();
      setIsAuthenticated(res.authenticated);
      setCurrentUser(res.user);
    } catch (e: any) {
      setIsAuthenticated(false);
      setCurrentUser(null);
    } finally {
      setIsCheckingAuth(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Load folders and models whenever current folder or search changes
  const loadContent = useCallback(
    async (folderId: string, search: string) => {
      if (!isAuthenticated) return;
      setIsLoadingContent(true);
      setError(null);

      try {
        if (search.trim()) {
          // If searching, search models globally or in folder
          const foundModels = await driveService.getModels('all', search);
          setModels(foundModels);
          setFolders([]);
        } else {
          // Normal folder navigation: load subfolders and models in folderId
          const [fetchedFolders, fetchedModels] = await Promise.all([
            driveService.getFolders(folderId),
            driveService.getModels(folderId),
          ]);
          setFolders(fetchedFolders);
          setModels(fetchedModels);
        }
      } catch (err: any) {
        console.error('Error loading Google Drive contents:', err);
        setError(err.message || 'Error al conectar con Google Drive');
      } finally {
        setIsLoadingContent(false);
      }
    },
    [isAuthenticated]
  );

  useEffect(() => {
    if (isAuthenticated) {
      loadContent(currentFolderId, searchQuery);
    }
  }, [isAuthenticated, currentFolderId, searchQuery, loadContent]);

  const loginWithGoogle = async () => {
    try {
      setError(null);
      const url = await driveService.getAuthUrl();
      window.location.href = url;
    } catch (err: any) {
      setError('No se pudo conectar con el microservicio de Google Drive. Asegúrate de que el servidor esté activo.');
    }
  };

  const logout = async () => {
    await driveService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setFolders([]);
    setModels([]);
    setCurrentFolderId('root');
    setBreadcrumbs([{ id: 'root', name: 'Mi Unidad' }]);
  };

  const navigateToFolder = (folderId: string, folderName: string) => {
    setSearchQuery('');
    setCurrentFolderId(folderId);
    setBreadcrumbs((prev) => [...prev, { id: folderId, name: folderName }]);
  };

  const navigateToBreadcrumb = (index: number) => {
    setSearchQuery('');
    const target = breadcrumbs[index];
    if (!target) return;
    setCurrentFolderId(target.id);
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
  };

  const refresh = () => {
    loadContent(currentFolderId, searchQuery);
  };

  return {
    isAuthenticated,
    currentUser,
    isCheckingAuth,
    folders,
    models,
    breadcrumbs,
    currentFolderId,
    isLoadingContent,
    searchQuery,
    setSearchQuery,
    error,
    loginWithGoogle,
    logout,
    navigateToFolder,
    navigateToBreadcrumb,
    refresh,
    checkAuth,
  };
}

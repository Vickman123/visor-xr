// Google Drive Microservice API Client for Visor XR

const API_BASE_URL =
  import.meta.env.VITE_GDRIVE_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    ? `https://${window.location.hostname}:4000`
    : 'http://localhost:4000');

export interface DriveUser {
  email?: string;
  name?: string;
  picture?: string;
}

export interface DriveFolder {
  id: string;
  name: string;
  modifiedTime?: string;
}

export interface DriveModel {
  id: string;
  name: string;
  size: number;
  sizeFormatted: string;
  modifiedTime: string;
  thumbnailLink?: string | null;
  streamUrl: string;
}

export const driveService = {
  getApiBaseUrl(): string {
    return API_BASE_URL;
  },

  getStoredToken(): string | null {
    try {
      return localStorage.getItem('vxr_gdrive_token');
    } catch (_) {
      return null;
    }
  },

  setStoredToken(token: string | null): void {
    try {
      if (token) {
        localStorage.setItem('vxr_gdrive_token', token);
      } else {
        localStorage.removeItem('vxr_gdrive_token');
      }
    } catch (_) {}
  },

  getAuthHeaders(): HeadersInit {
    const token = this.getStoredToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  /**
   * Request Google OAuth2 consent URL
   */
  async getAuthUrl(redirectDestination?: string): Promise<string> {
    const redirect = redirectDestination || (typeof window !== 'undefined' ? window.location.href : '');
    const res = await fetch(
      `${API_BASE_URL}/api/auth/google/url?redirect=${encodeURIComponent(redirect)}`
    );
    if (!res.ok) throw new Error('No se pudo obtener la URL de autenticación');
    const data = await res.json();
    return data.url;
  },

  /**
   * Check if current session is authenticated
   */
  async checkAuthStatus(): Promise<{ authenticated: boolean; user: DriveUser | null }> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/status`, {
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });
      if (!res.ok) return { authenticated: false, user: null };
      const data = await res.json();
      return {
        authenticated: !!data.authenticated,
        user: data.user || null,
      };
    } catch (err) {
      console.warn('Google Drive microservice not reachable or offline:', err);
      return { authenticated: false, user: null };
    }
  },

  /**
   * Log out and clear session
   */
  async logout(): Promise<void> {
    this.setStoredToken(null);
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        credentials: 'include',
      });
    } catch (_) {}
  },

  /**
   * List folders inside parent
   */
  async getFolders(parentId = 'root'): Promise<DriveFolder[]> {
    const res = await fetch(
      `${API_BASE_URL}/api/drive/folders?parentId=${encodeURIComponent(parentId)}`,
      {
        headers: this.getAuthHeaders(),
        credentials: 'include',
      }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al listar carpetas de Google Drive');
    }
    const data = await res.json();
    return data.folders || [];
  },

  /**
   * Search and list GLB models in a folder or globally
   */
  async getModels(folderId = 'all', search = ''): Promise<DriveModel[]> {
    const params = new URLSearchParams();
    if (folderId) params.set('folderId', folderId);
    if (search.trim()) params.set('search', search.trim());

    const res = await fetch(`${API_BASE_URL}/api/drive/models?${params.toString()}`, {
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al buscar modelos 3D en Google Drive');
    }
    const data = await res.json();
    return data.models || [];
  },

  /**
   * Get direct streaming URL for a GLB model
   */
  getStreamUrl(fileId: string): string {
    const token = this.getStoredToken();
    const tokenParam = token ? `?token=${encodeURIComponent(token)}` : '';
    return `${API_BASE_URL}/api/drive/stream/${encodeURIComponent(fileId)}${tokenParam}`;
  },
};

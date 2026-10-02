import { Router, Request, Response, NextFunction } from 'express';
import { getDriveClient, verifySessionToken } from '../utils/oauthClient.js';

export const driveRouter = Router();

// Middleware to extract authenticated drive client
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token =
    req.cookies?.vxr_gdrive_session ||
    (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null);

  if (!token) {
    res.status(401).json({ error: 'Unauthorized', message: 'No active Google Drive session found' });
    return;
  }

  const session = verifySessionToken(token);
  if (!session || !session.tokens?.access_token) {
    res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired session' });
    return;
  }

  try {
    const drive = getDriveClient(session.tokens);
    (req as any).drive = drive;
    (req as any).userSession = session;
    next();
  } catch (err: any) {
    res.status(500).json({ error: 'Drive Client Error', message: err.message });
  }
}

driveRouter.use(requireAuth);

/**
 * GET /api/drive/folders
 * Lists folders within a given parent folder (or 'root')
 */
driveRouter.get('/folders', async (req: Request, res: Response) => {
  const drive = (req as any).drive;
  const parentId = (req.query.parentId as string) || 'root';

  try {
    const query = `'${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
    const response = await drive.files.list({
      q: query,
      fields: 'files(id, name, modifiedTime, shared, owners)',
      orderBy: 'name',
      pageSize: 100,
    });

    res.json({
      parentId,
      folders: response.data.files || [],
    });
  } catch (error: any) {
    console.error('List Folders Error:', error);
    res.status(500).json({ error: 'Failed to list folders', message: error.message });
  }
});

/**
 * GET /api/drive/models
 * Searches and lists .glb models within a folder or across the user's Drive
 */
driveRouter.get('/models', async (req: Request, res: Response) => {
  const drive = (req as any).drive;
  const folderId = req.query.folderId as string;
  const search = req.query.search as string;

  try {
    const queryParts = [
      "trashed = false",
      "(name contains '.glb' or fileExtension = 'glb' or mimeType = 'model/gltf-binary')",
    ];

    if (folderId && folderId !== 'all') {
      queryParts.push(`'${folderId}' in parents`);
    }

    if (search && search.trim()) {
      const sanitized = search.replace(/'/g, "\\'");
      queryParts.push(`name contains '${sanitized}'`);
    }

    const q = queryParts.join(' and ');

    const response = await drive.files.list({
      q,
      fields: 'files(id, name, size, modifiedTime, thumbnailLink, iconLink, webViewLink, owners)',
      orderBy: 'modifiedTime desc',
      pageSize: 100,
    });

    const models = (response.data.files || []).map((file: any) => ({
      id: file.id,
      name: file.name,
      size: file.size ? parseInt(file.size, 10) : 0,
      sizeFormatted: formatBytes(file.size ? parseInt(file.size, 10) : 0),
      modifiedTime: file.modifiedTime,
      thumbnailLink: file.thumbnailLink || null,
      streamUrl: `/api/drive/stream/${file.id}`,
    }));

    res.json({
      folderId: folderId || 'all',
      count: models.length,
      models,
    });
  } catch (error: any) {
    console.error('List Models Error:', error);
    res.status(500).json({ error: 'Failed to list 3D models', message: error.message });
  }
});

/**
 * GET /api/drive/stream/:fileId
 * Streams the .glb model binary bytes directly with range/chunking support for high-performance 3D loading
 */
driveRouter.get('/stream/:fileId', async (req: Request, res: Response) => {
  const drive = (req as any).drive;
  const fileId = req.params.fileId;

  try {
    // 1. Fetch file metadata for headers
    const metaRes = await drive.files.get({
      fileId,
      fields: 'id, name, size, mimeType',
    });

    const fileName = metaRes.data.name || 'model.glb';
    const fileSize = metaRes.data.size ? parseInt(metaRes.data.size, 10) : undefined;

    res.setHeader('Content-Type', 'model/gltf-binary');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(fileName)}"`);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache model 24h

    if (fileSize) {
      res.setHeader('Content-Length', fileSize);
    }

    // 2. Stream the binary media
    const mediaStream = await drive.files.get(
      {
        fileId,
        alt: 'media',
      },
      {
        responseType: 'stream',
      }
    );

    mediaStream.data
      .on('error', (err: any) => {
        console.error('Streaming binary error:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Stream error', message: err.message });
        }
      })
      .pipe(res);
  } catch (error: any) {
    console.error('Get Model Stream Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to stream model', message: error.message });
    }
  }
});

function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

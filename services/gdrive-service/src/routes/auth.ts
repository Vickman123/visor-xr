import { Router, Request, Response } from 'express';
import {
  generateAuthUrl,
  getTokensFromCode,
  getUserInfoClient,
  createSessionToken,
  verifySessionToken,
  SessionData,
} from '../utils/oauthClient.js';

export const authRouter = Router();

/**
 * GET /api/auth/google/url
 * Returns the Google OAuth consent URL for frontend redirection or popup
 */
authRouter.get('/google/url', (req: Request, res: Response) => {
  try {
    const redirectAfter = (req.query.redirect as string) || '';
    const state = redirectAfter ? Buffer.from(redirectAfter).toString('base64') : undefined;
    const url = generateAuthUrl(state);
    res.json({ url });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to generate auth url', message: error.message });
  }
});

/**
 * GET /api/auth/google/callback
 * Handles Google OAuth redirect callback, exchanges code for tokens, and sets session
 */
authRouter.get('/google/callback', async (req: Request, res: Response) => {
  const code = req.query.code as string;
  const state = req.query.state as string;

  if (!code) {
    res.status(400).send('No authorization code provided by Google.');
    return;
  }

  try {
    const tokens = await getTokensFromCode(code);

    // Retrieve user profile information
    let userProfile = undefined;
    try {
      const userInfoClient = getUserInfoClient(tokens);
      const userInfo = await userInfoClient.userinfo.get();
      userProfile = {
        email: userInfo.data.email || undefined,
        name: userInfo.data.name || undefined,
        picture: userInfo.data.picture || undefined,
      };
    } catch (e) {
      console.warn('Could not fetch user profile details:', e);
    }

    const sessionData: SessionData = {
      tokens,
      user: userProfile,
    };

    const sessionToken = createSessionToken(sessionData);

    // Set secure HTTP-only cookie
    res.cookie('vxr_gdrive_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Determine frontend redirect destination
    let frontendOrigin = (process.env.FRONTEND_ORIGIN || '').split(',')[0].trim() || 'https://localhost:5173';
    let targetUrl = frontendOrigin;
    if (state && state !== 'visor_xr_auth') {
      try {
        const decoded = Buffer.from(state, 'base64').toString('ascii');
        if (decoded.startsWith('http://') || decoded.startsWith('https://')) {
          targetUrl = decoded;
        }
      } catch (_) {}
    }

    // Pass sessionToken in hash or query for cross-domain / iframe / mobile support
    const separator = targetUrl.includes('?') ? '&' : '?';
    res.redirect(`${targetUrl}${separator}gdrive_auth=success&token=${encodeURIComponent(sessionToken)}`);
  } catch (error: any) {
    console.error('OAuth Callback Error:', error);
    res.status(500).send(`Authentication failed: ${error.message}`);
  }
});

/**
 * GET /api/auth/status
 * Returns current authenticated user and session validity
 */
authRouter.get('/status', (req: Request, res: Response) => {
  const token =
    req.cookies?.vxr_gdrive_session ||
    (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null);

  if (!token) {
    res.json({ authenticated: false });
    return;
  }

  const session = verifySessionToken(token);
  if (!session || !session.tokens?.access_token) {
    res.json({ authenticated: false });
    return;
  }

  res.json({
    authenticated: true,
    user: session.user || null,
  });
});

/**
 * POST /api/auth/logout
 * Destroys session
 */
authRouter.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('vxr_gdrive_session');
  res.json({ success: true, message: 'Logged out successfully' });
});

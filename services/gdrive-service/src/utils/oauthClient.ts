import { google } from 'googleapis';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:4000/api/auth/google/callback';
const SESSION_SECRET = process.env.SESSION_SECRET || 'visor_xr_secret_fallback_key';

// Scopes required: read-only access to drive files
export const DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
];

/**
 * Creates a new OAuth2 client instance
 */
export function createOAuth2Client() {
  return new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );
}

/**
 * Generates the Google OAuth authorization URL
 */
export function generateAuthUrl(state?: string): string {
  const oauth2Client = createOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: DRIVE_SCOPES,
    state: state || 'visor_xr_auth',
  });
}

/**
 * Exchanges an authorization code for access and refresh tokens
 */
export async function getTokensFromCode(code: string) {
  const oauth2Client = createOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

/**
 * Creates an authenticated Google Drive API client using tokens
 */
export function getDriveClient(tokens: any) {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials(tokens);
  return google.drive({ version: 'v3', auth: oauth2Client });
}

/**
 * Creates an authenticated Google OAuth2 userinfo client using tokens
 */
export function getUserInfoClient(tokens: any) {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials(tokens);
  return google.oauth2({ version: 'v2', auth: oauth2Client });
}

export interface SessionData {
  tokens: {
    access_token?: string | null;
    refresh_token?: string | null;
    scope?: string;
    token_type?: string | null;
    expiry_date?: number | null;
  };
  user?: {
    email?: string;
    name?: string;
    picture?: string;
  };
}

/**
 * Creates a signed JWT session string containing tokens
 */
export function createSessionToken(data: SessionData): string {
  return jwt.sign(data, SESSION_SECRET, { expiresIn: '7d' });
}

/**
 * Verifies and decodes a session JWT
 */
export function verifySessionToken(token: string): SessionData | null {
  try {
    return jwt.verify(token, SESSION_SECRET) as SessionData;
  } catch (err) {
    return null;
  }
}

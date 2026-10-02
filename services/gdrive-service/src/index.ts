import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth.js';
import { driveRouter } from './routes/drive.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Allowed frontend origins for CORS
const allowedOrigins = (process.env.FRONTEND_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

// Default local origins
const defaultOrigins = [
  'https://localhost:5173',
  'http://localhost:5173',
  'https://127.0.0.1:5173',
  'http://127.0.0.1:5173',
];

const allAllowedOrigins = [...new Set([...defaultOrigins, ...allowedOrigins])];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (
        allAllowedOrigins.includes(origin) ||
        origin.endsWith('.github.io') ||
        origin.startsWith('https://192.168.') ||
        origin.startsWith('http://192.168.')
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev, can restrict in production
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Range', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'Accept-Ranges', 'Content-Length'],
  })
);

app.use(cookieParser());
app.use(express.json());

// Healthcheck
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'visor-xr-gdrive-service',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRouter);
app.use('/api/drive', driveRouter);

app.listen(PORT, () => {
  console.log(`🚀 Visor XR Google Drive Microservice listening on http://localhost:${PORT}`);
  console.log(`🔒 Allowed origins: ${allAllowedOrigins.join(', ')}`);
});

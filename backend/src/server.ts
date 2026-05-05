import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import http from 'http';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import User from './models/User';

import apiRouter from './routes/v1';
import { setupSwagger } from './lib/swagger';
import { initRedis, closeRedis } from './lib/redis';
import { initCloudinary } from './lib/cloudinary';
import { setupSocketIO } from './lib/socket';
import connectDB from './lib/mongodb';
import { generateCsrfToken } from './lib/csrf';
import { requestTimeout } from './middleware/timeout';
import { requestIdMiddleware } from './middleware/requestId';
import { validateEnvironment } from './lib/env';
import { optionalAuth } from './lib/authorization';

const app = express();

app.set('trust proxy', 1);
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

const API_VERSION = 'v1';
const API_PREFIX = `/api/${API_VERSION}`;
const DEPRECATED_VERSIONS = ['v0'];

const origins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((value) => value.trim()).filter(Boolean)
  : ['http://localhost:3000'];

const isDevelopment = process.env.NODE_ENV !== 'production';

app.use(helmet({
  contentSecurityPolicy: isDevelopment ? false : {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
}));

app.use(requestIdMiddleware);

// HTTPS enforcement in production
if (process.env.NODE_ENV === 'production') {
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
      next();
    } else {
      res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
  });
}

app.use(
  cors({
    origin: origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-CSRF-Token'],
  }),
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());
app.use(requestTimeout({ timeout: 30000, message: 'Request timeout after 30 seconds' }));

if (isDevelopment) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

import { defaultUserLimiter, authRateLimiter } from './middleware/rateLimiter';

app.use(`${API_PREFIX}/auth`, authRateLimiter);
app.use(API_PREFIX, defaultUserLimiter);

setupSwagger(app);

app.get('/', (_req, res) => {
  res.redirect('/api-docs');
});

app.get(`${API_PREFIX}/auth/csrf-token`, optionalAuth, (req: any, res) => {
  const sessionId = req.user?.userId || req.cookies?.sessionId || crypto.randomUUID();
  const csrfToken = generateCsrfToken(sessionId);

  res.cookie('sessionId', sessionId, {
    httpOnly: true,
    secure: !isDevelopment,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.cookie('csrfToken', csrfToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.json({ csrfToken });
});

app.get('/api/v1', (_req, res) => {
  res.json({
    message: 'ClassBridge API',
    version: API_VERSION,
    docs: '/api-docs',
    health: '/health',
  });
});

app.use(API_PREFIX, (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('API-Version', API_VERSION);
  res.setHeader('API-Supported-Versions', 'v1');
  next();
}, apiRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Server error:', err);

  const message = isDevelopment ? err.message : 'Internal server error';

  res.status(500).json({
    error: message,
    ...(isDevelopment && { stack: err.stack }),
  });
});

// Removed redundant and recursive initEnvironment function

function gracefulShutdown(signal: string) {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  closeRedis().catch(console.error);

  process.exit(0);
}

validateEnvironment();

import { startCronScheduler } from './lib/cron';

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

async function initializeServices() {
  try {
    await initRedis();
  } catch (error) {
    console.warn('Redis initialization failed, continuing without Redis:', error);
  }

  try {
    await connectDB();
    console.log('Successfully connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }

  try {
    initCloudinary();
  } catch (error) {
    console.warn('Cloudinary initialization failed, continuing without Cloudinary:', error);
  }

  await seedAdminIfNeeded();
}

async function seedAdminIfNeeded() {
  const autoSeed = process.env.AUTO_SEED_ADMIN !== 'false';
  if (!autoSeed) {
    return;
  }

  const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'superadmin@classbridge.com';
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD || 'Admin@ClassBridge2026';

  try {
    const existingAdmin = await User.findOne({ role: 'system_admin' });

    if (existingAdmin) {
      console.log('System admin already exists, skipping seed.');
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const admin = new User({
      email: adminEmail,
      name: process.env.SUPER_ADMIN_NAME || 'System Administrator',
      role: 'system_admin',
      password: hashedPassword,
      isActive: true,
      isApproved: true,
    });

    await admin.save();

    console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║  🚀 System Admin Created Successfully!                               ║
║                                                                      ║
║  Email:    ${adminEmail.padEnd(48)}          ║
║  Password:  ${adminPassword.padEnd(48)}         ║
║                                                                      ║
║  Please change the password after first login!                       ║
╚══════════════════════════════════════════════════════════════════════╝
        `);
  } catch (error) {
    console.error('Failed to seed admin:', error);
  }
}

const httpServer = http.createServer(app);

initializeServices().then(() => {
  try {
    setupSocketIO(httpServer);
  } catch (error) {
    console.warn('Socket.io initialization failed, continuing without Socket.io:', error);
  }

  try {
    startCronScheduler();
  } catch (error) {
    console.warn('Cron scheduler initialization failed:', error);
  }
});

const server = httpServer.listen(port, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║   🎓 ClassBridge API Server                                            ║
║                                                                        ║
║   Version: ${API_VERSION}                                                          ║
║   Port: ${port}                                                           ║
║   Environment: ${isDevelopment ? 'development' : 'production'}                                             ║
║                                                                        ║
║   Endpoints:                                                           ║
║   • API:       ${API_PREFIX}                                                 ║
║   • Swagger:   http://localhost:${port}/api-docs                          ║
║   • Health:    http://localhost:${port}/health                            ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝
  `);
});

export default server;

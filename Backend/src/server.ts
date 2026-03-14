import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import http from 'http';

import apiRouter from './routes/api';
import { setupSwagger } from './lib/swagger';
import { initRedis, closeRedis } from './lib/redis';
import { initCloudinary } from './lib/cloudinary';
import { setupSocketIO } from './lib/socket';

dotenv.config();

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

const API_VERSION = 'v1';
const API_PREFIX = `/api/${API_VERSION}`;

const origins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((value) => value.trim()).filter(Boolean)
  : ['http://localhost:3000'];

const isDevelopment = process.env.NODE_ENV !== 'production';

app.use(helmet({
  contentSecurityPolicy: isDevelopment ? false : undefined,
  crossOriginEmbedderPolicy: false,
}));

app.use(
  cors({
    origin: origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  }),
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

if (isDevelopment) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: { error: 'Too many authentication attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(`${API_PREFIX}/auth`, authLimiter);
app.use(API_PREFIX, apiLimiter);

setupSwagger(app);

app.get('/', (_req, res) => {
  res.redirect('/api-docs');
});

app.get('/api/v1', (_req, res) => {
  res.json({
    message: 'ClassBridge API',
    version: API_VERSION,
    docs: '/api-docs',
    health: '/health',
  });
});

app.use(API_PREFIX, apiRouter);

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

function validateEnvironment() {
  const required = ['MONGODB_URI', 'SESSION_SECRET'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.warn(`Warning: Missing environment variables: ${missing.join(', ')}`);
  }
}

function gracefulShutdown(signal: string) {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  closeRedis().catch(console.error);
  
  process.exit(0);
}

validateEnvironment();

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

async function initializeServices() {
    try {
        await initRedis();
    } catch (error) {
        console.warn('Redis initialization failed, continuing without Redis:', error);
    }

    try {
        initCloudinary();
    } catch (error) {
        console.warn('Cloudinary initialization failed, continuing without Cloudinary:', error);
    }
}

const httpServer = http.createServer(app);

initializeServices().then(() => {
    try {
        setupSocketIO(httpServer);
    } catch (error) {
        console.warn('Socket.io initialization failed, continuing without Socket.io:', error);
    }
});

const server = httpServer.listen(port, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║   🎓 ClassBridge API Server                                             ║
║                                                                        ║
║   Version: ${API_VERSION}                                                             ║
║   Port: ${port}                                                           ║
║   Environment: ${isDevelopment ? 'development' : 'production'}                                        ║
║                                                                   ║
║   Endpoints:                                                      ║
║   • API:       ${API_PREFIX}                                            ║
║   • Swagger:   http://localhost:${port}/api-docs║
║   • Health:    http://localhost:${port}/health                    ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
  `);
});

export default server;

import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

import apiRouter from './routes/api';
import { setupSwagger } from './lib/swagger';

dotenv.config();

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

const origins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((value) => value.trim()).filter(Boolean)
  : ['http://localhost:3000'];

app.use(
  cors({
    origin: origins,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

setupSwagger(app);

app.use('/api', apiRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Backend API listening on port ${port}`);
  console.log(`Swagger documentation available at http://localhost:${port}/api-docs`);
});

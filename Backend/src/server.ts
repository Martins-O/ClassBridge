import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

import apiRouter from './routes/api';

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

app.use('/api', apiRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Backend API listening on port ${port}`);
});

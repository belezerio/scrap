import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env';
import apiRouter from './routes';
import { errorHandler } from './middlewares/error.middleware';
import { AppError } from './utils/AppError';

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: config.FRONTEND_URL,
    credentials: true,
  })
);

// Logging middleware
if (config.NODE_ENV !== 'test') {
  app.use(morgan(config.NODE_ENV === 'development' ? 'dev' : 'combined'));
}

// Request body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Version 1 Routes
app.use('/api/v1', apiRouter);

// Handle 404 Undefined Routes
app.use('*', (_req, _res, next) => {
  next(AppError.notFound('Requested route not found'));
});

// Centralized Global Error Handler
app.use(errorHandler);

export default app;

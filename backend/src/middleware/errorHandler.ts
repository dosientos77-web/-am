import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';

export function notFoundHandler(req: Request, res: Response, _next: NextFunction): void {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }

  if (err.name === 'ValidationError') {
    res.status(400).json({ success: false, message: 'Validation error', details: err.message });
    return;
  }

  if (err.name === 'CastError') {
    res.status(400).json({ success: false, message: 'Invalid ID format' });
    return;
  }

  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({ success: false, message: 'Invalid token' });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({ success: false, message: 'Token expired' });
    return;
  }

  // Duplicate key error from MongoDB
  if ((err as { code?: number }).code === 11000) {
    res.status(409).json({ success: false, message: 'Duplicate field value' });
    return;
  }

  console.error('[ERROR]', err);
  const message = env.nodeEnv === 'production' ? 'Internal server error' : err.message;
  res.status(500).json({ success: false, message });
}

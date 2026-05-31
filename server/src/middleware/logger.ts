import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Generate a unique Request ID for production tracing and log aggregation
  const requestId = crypto.randomUUID();
  (req as any).id = requestId;
  res.setHeader('X-Request-ID', requestId);

  // Monitor high-precision process time
  const start = process.hrtime();
  const timestamp = new Date().toISOString();

  // Wait until the response is completed to calculate execution duration
  res.on('finish', () => {
    const diff = process.hrtime(start);
    const durationMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(3);
    console.log(`[${timestamp}] [${requestId}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${durationMs}ms)`);
  });

  next();
};

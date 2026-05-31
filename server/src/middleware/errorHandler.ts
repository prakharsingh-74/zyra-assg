import { Request, Response, NextFunction } from 'express';

export const errorHandlerMiddleware = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  const requestId = (req as any).id || 'unknown-request-id';
  const timestamp = new Date().toISOString();

  // Log the complete error stack trace securely on the server console
  console.error(`[${timestamp}] [${requestId}] Global exception caught:`, err.stack || err);

  // Respond with a clean, secure error schema to avoid leaking internal system details
  return res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected exception was encountered in the Action Center database service.',
    requestId
  });
};

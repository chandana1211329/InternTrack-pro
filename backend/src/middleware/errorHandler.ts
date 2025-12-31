import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values((err as any).errors || {}).map((val: any) => val.message).join(', ');
    error = {
      ...error,
      statusCode: 400,
      message: message || 'Validation Error'
    };
  }

  // Mongoose duplicate key error
  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0];
    error = {
      ...error,
      statusCode: 400,
      message: `${field} already exists`
    };
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    error = {
      ...error,
      statusCode: 400,
      message: 'Resource not found'
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      ...error,
      statusCode: 401,
      message: 'Invalid token'
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      ...error,
      statusCode: 401,
      message: 'Token expired'
    };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not found - ${req.originalUrl}`) as AppError;
  error.statusCode = 404;
  next(error);
};

export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);

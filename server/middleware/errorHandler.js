// ============================================
// MES Application - Centralized Error Handler
// ============================================

/**
 * Custom application error with HTTP status code.
 */
class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Express error-handling middleware.
 * Must have 4 params to be recognized as an error handler.
 */
const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  console.error(`[ERROR] ${statusCode} - ${err.message}`, {
    path: req.originalUrl,
    method: req.method,
    ...(isProduction ? {} : { stack: err.stack }),
  });

  res.status(statusCode).json({
    success: false,
    error: {
      message: err.isOperational ? err.message : 'Internal server error',
      ...(err.details && { details: err.details }),
      ...(!isProduction && { stack: err.stack }),
    },
  });
};

/**
 * Wrap async route handlers to catch rejected promises.
 * Usage: router.get('/path', asyncHandler(async (req, res) => { ... }))
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { AppError, errorHandler, asyncHandler };

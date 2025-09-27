const mongoose = require('mongoose');

// Custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.name = this.constructor.name;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Handle MongoDB casting errors
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

// Handle MongoDB duplicate field errors
const handleDuplicateFieldsDB = (err) => {
  const duplicatedField = Object.keys(err.keyValue)[0];
  const duplicatedValue = err.keyValue[duplicatedField];
  const message = `${duplicatedField.charAt(0).toUpperCase() + duplicatedField.slice(1)} '${duplicatedValue}' already exists. Please use another value.`;
  return new AppError(message, 400);
};

// Handle MongoDB validation errors
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// Handle JWT errors
const handleJWTError = () => 
  new AppError('Invalid token. Please log in again.', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

// Handle Multer errors
const handleMulterError = (err) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return new AppError('File too large. Please upload a smaller file.', 400);
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    return new AppError('Too many files. Please upload fewer files.', 400);
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return new AppError('Unexpected file field. Please check your form.', 400);
  }
  return new AppError('File upload error.', 400);
};

// Send error for development
const sendErrorDev = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.name,
      message: err.message,
      stack: err.stack,
      ...(err.errors && { validationErrors: err.errors })
    });
  }

  // B) RENDERED WEBSITE
  console.error('ERROR 💥', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message
  });
};

// Send error for production
const sendErrorProd = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message
      });
    }

    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong!'
    });
  }

  // B) RENDERED WEBSITE
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message
    });
  }

  // Programming or other unknown error: don't leak error details
  console.error('ERROR 💥', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.'
  });
};

// Not found middleware
const notFound = (req, res, next) => {
  const message = `Route ${req.originalUrl} not found`;
  const error = new AppError(message, 404);
  next(error);
};

// Global error handler
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    error.name = err.name;

    // MongoDB errors
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    
    // JWT errors
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    
    // Multer errors
    if (error.name === 'MulterError') error = handleMulterError(error);

    sendErrorProd(error, req, res);
  }
};

// Async error wrapper
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// Handle unhandled promise rejections
const handleUnhandledRejection = () => {
  process.on('unhandledRejection', (err, promise) => {
    console.error('UNHANDLED REJECTION! 💥 Shutting down...');
    console.error('Error:', err.message);
    console.error('Promise:', promise);
    
    // Close server & exit process
    process.exit(1);
  });
};

// Handle uncaught exceptions
const handleUncaughtException = () => {
  process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error('Error:', err.name, err.message);
    console.error('Stack:', err.stack);
    
    process.exit(1);
  });
};

// Handle SIGTERM
const handleSIGTERM = (server) => {
  process.on('SIGTERM', () => {
    console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
    server.close(() => {
      console.log('💥 Process terminated!');
    });
  });
};

// Log errors to external service (e.g., Sentry, LogRocket, etc.)
const logError = (error, req = null) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    ...(req && {
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?._id
    })
  };

  // In production, you might want to send this to an external logging service
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to Sentry, LogRocket, or your preferred error tracking service
    // Sentry.captureException(error, { extra: errorInfo });
    console.error('Error logged:', errorInfo);
  } else {
    console.error('Development error:', errorInfo);
  }
};

// Validation error formatter
const formatValidationErrors = (errors) => {
  if (Array.isArray(errors)) {
    return errors.map(error => ({
      field: error.path || error.param,
      message: error.msg || error.message,
      value: error.value
    }));
  }
  
  return Object.keys(errors).map(key => ({
    field: key,
    message: errors[key].message,
    value: errors[key].value
  }));
};

// Express-validator error handler
const handleExpressValidatorErrors = (req, res, next) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = formatValidationErrors(errors.array());
    const error = new AppError('Validation failed', 400);
    error.validationErrors = formattedErrors;
    return next(error);
  }
  
  next();
};

// MongoDB connection error handler
const handleMongoConnectionErrors = () => {
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
    logError(err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected. Attempting to reconnect...');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnected successfully');
  });
};

// Rate limit error handler
const handleRateLimitError = (err, req, res, next) => {
  if (err.status === 429) {
    logError(err, req);
    return res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.',
      retryAfter: err.retryAfter || 900 // 15 minutes default
    });
  }
  next(err);
};

// CORS error handler
const handleCorsError = (err, req, res, next) => {
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      message: 'CORS error: Request blocked by CORS policy'
    });
  }
  next(err);
};

// File size error handler
const handleFileSizeError = (err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: `File too large. Maximum file size is ${err.limit / (1024 * 1024)}MB`
    });
  }
  next(err);
};

// Security error handler
const handleSecurityErrors = (err, req, res, next) => {
  // Handle various security-related errors
  if (err.message && err.message.includes('security')) {
    logError(err, req);
    return res.status(403).json({
      success: false,
      message: 'Security violation detected'
    });
  }
  next(err);
};

module.exports = {
  AppError,
  catchAsync,
  notFound,
  globalErrorHandler,
  handleUnhandledRejection,
  handleUncaughtException,
  handleSIGTERM,
  logError,
  formatValidationErrors,
  handleExpressValidatorErrors,
  handleMongoConnectionErrors,
  handleRateLimitError,
  handleCorsError,
  handleFileSizeError,
  handleSecurityErrors
};

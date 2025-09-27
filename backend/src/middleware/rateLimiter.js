const rateLimit = require('express-rate-limit');
const MongoStore = require('rate-limit-mongo');

// Create MongoDB store for rate limiting (for distributed systems)
const createMongoStore = () => {
  if (process.env.MONGODB_URI) {
    return new MongoStore({
      uri: process.env.MONGODB_URI,
      collectionName: 'rate_limits',
      expireTimeMs: 15 * 60 * 1000 // 15 minutes
    });
  }
  return undefined; // Use memory store as fallback
};

// General API rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: 15 * 60 // 15 minutes in seconds
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  store: createMongoStore(),
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise use IP
    return req.user ? req.user._id.toString() : req.ip;
  }
});

// Strict limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 auth attempts per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: createMongoStore(),
  skipSuccessfulRequests: true // Don't count successful requests
});

// Password reset limiter
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 password reset requests per hour
  message: {
    success: false,
    message: 'Too many password reset attempts, please try again after 1 hour.',
    retryAfter: 60 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: createMongoStore()
});

// Email verification limiter
const emailVerificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 email verification requests per hour
  message: {
    success: false,
    message: 'Too many email verification attempts, please try again after 1 hour.',
    retryAfter: 60 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: createMongoStore()
});

// File upload limiter
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each user to 10 file uploads per 15 minutes
  message: {
    success: false,
    message: 'Too many file uploads, please try again later.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: createMongoStore(),
  keyGenerator: (req) => {
    return req.user ? req.user._id.toString() : req.ip;
  }
});

// AI service limiter (for resume generation, etc.)
const aiServiceLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each user to 20 AI requests per hour
  message: {
    success: false,
    message: 'AI service usage limit exceeded. Please try again after 1 hour.',
    retryAfter: 60 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: createMongoStore(),
  keyGenerator: (req) => {
    return req.user ? req.user._id.toString() : req.ip;
  }
});

// Search/API calls limiter
const searchLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // Limit each user to 100 search requests per 5 minutes
  message: {
    success: false,
    message: 'Search rate limit exceeded, please try again in a few minutes.',
    retryAfter: 5 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: createMongoStore(),
  keyGenerator: (req) => {
    return req.user ? req.user._id.toString() : req.ip;
  }
});

// Create/Update operations limiter
const createLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // Limit each user to 50 create/update operations per 5 minutes
  message: {
    success: false,
    message: 'Too many create/update operations, please try again later.',
    retryAfter: 5 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: createMongoStore(),
  keyGenerator: (req) => {
    return req.user ? req.user._id.toString() : req.ip;
  }
});

// Email sending limiter
const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each user to 10 emails per hour
  message: {
    success: false,
    message: 'Email sending limit exceeded, please try again after 1 hour.',
    retryAfter: 60 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: createMongoStore(),
  keyGenerator: (req) => {
    return req.user ? req.user._id.toString() : req.ip;
  }
});

// Flexible rate limiter factory
const createCustomLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {
      success: false,
      message: 'Rate limit exceeded, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    store: createMongoStore()
  };

  return rateLimit({ ...defaultOptions, ...options });
};

// Skip rate limiting for certain conditions
const skipRateLimit = (req) => {
  // Skip rate limiting in test environment
  if (process.env.NODE_ENV === 'test') {
    return true;
  }

  // Skip for whitelisted IPs (if configured)
  const whitelistedIPs = process.env.RATE_LIMIT_WHITELIST?.split(',') || [];
  if (whitelistedIPs.includes(req.ip)) {
    return true;
  }

  // Skip for premium users (if applicable)
  if (req.user && req.user.plan === 'premium') {
    return true;
  }

  return false;
};

// Apply skip function to all limiters
[
  generalLimiter,
  authLimiter,
  passwordResetLimiter,
  emailVerificationLimiter,
  uploadLimiter,
  aiServiceLimiter,
  searchLimiter,
  createLimiter,
  emailLimiter
].forEach(limiter => {
  limiter.skip = skipRateLimit;
});

// Rate limit error handler
const rateLimitErrorHandler = (error, req, res, next) => {
  if (error && error.status === 429) {
    console.warn(`Rate limit exceeded for ${req.ip} on ${req.path}`);
  }
  next(error);
};

// Middleware to log rate limit hits
const logRateLimitHit = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(...args) {
    // Check if this is a rate limit response
    if (res.statusCode === 429) {
      console.warn(`Rate limit hit: ${req.method} ${req.path} - IP: ${req.ip} - User: ${req.user?._id || 'anonymous'}`);
    }
    
    originalSend.apply(this, args);
  };
  
  next();
};

module.exports = {
  generalLimiter,
  authLimiter,
  passwordResetLimiter,
  emailVerificationLimiter,
  uploadLimiter,
  aiServiceLimiter,
  searchLimiter,
  createLimiter,
  emailLimiter,
  createCustomLimiter,
  rateLimitErrorHandler,
  logRateLimitHit
};
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegister, validateLogin, validateForgotPassword, validateResetPassword } = require('../middleware/validation');
const rateLimiter = require('../middleware/rateLimiter');

// POST /api/auth/register - User registration
router.post('/register', rateLimiter.authLimiter, validateRegister, authController.register);

// POST /api/auth/login - User login
router.post('/login', rateLimiter.authLimiter, validateLogin, authController.login);

// POST /api/auth/logout - User logout
router.post('/logout', authController.logout);

// POST /api/auth/refresh - Refresh JWT token
router.post('/refresh', authController.refreshToken);

// POST /api/auth/forgot-password - Send password reset email
router.post('/forgot-password', rateLimiter.authLimiter, validateForgotPassword, authController.forgotPassword);

// POST /api/auth/reset-password - Reset password with token
router.post('/reset-password', validateResetPassword, authController.resetPassword);

// GET /api/auth/verify-email/:token - Verify email address
router.get('/verify-email/:token', authController.verifyEmail);

// POST /api/auth/resend-verification - Resend verification email
router.post('/resend-verification', rateLimiter.authLimiter, authController.resendVerification);

// GET /api/auth/me - Get current user info (protected)
router.get('/me', authController.getCurrentUser);

// POST /api/auth/change-password - Change password (protected)
router.post('/change-password', authController.changePassword);

// POST /api/auth/google - Google OAuth login
router.post('/google', authController.googleAuth);

// POST /api/auth/linkedin - LinkedIn OAuth login
router.post('/linkedin', authController.linkedinAuth);

module.exports = router;
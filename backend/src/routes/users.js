const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const upload = require('../config/multer');
const { validateUpdateProfile, validateUpdatePreferences } = require('../middleware/validation');

// All user routes require authentication
router.use(auth);

// GET /api/users/profile - Get user profile
router.get('/profile', userController.getProfile);

// PUT /api/users/profile - Update user profile
router.put('/profile', validateUpdateProfile, userController.updateProfile);

// POST /api/users/avatar - Upload profile avatar
router.post('/avatar', upload.single('avatar'), userController.uploadAvatar);

// DELETE /api/users/avatar - Delete profile avatar
router.delete('/avatar', userController.deleteAvatar);

// GET /api/users/preferences - Get user preferences
router.get('/preferences', userController.getPreferences);

// PUT /api/users/preferences - Update user preferences
router.put('/preferences', validateUpdatePreferences, userController.updatePreferences);

// GET /api/users/dashboard-stats - Get dashboard statistics
router.get('/dashboard-stats', userController.getDashboardStats);

// POST /api/users/skills - Add skills to profile
router.post('/skills', userController.addSkills);

// PUT /api/users/skills/:skillId - Update specific skill
router.put('/skills/:skillId', userController.updateSkill);

// DELETE /api/users/skills/:skillId - Remove skill from profile
router.delete('/skills/:skillId', userController.removeSkill);

// POST /api/users/experience - Add work experience
router.post('/experience', userController.addExperience);

// PUT /api/users/experience/:expId - Update work experience
router.put('/experience/:expId', userController.updateExperience);

// DELETE /api/users/experience/:expId - Remove work experience
router.delete('/experience/:expId', userController.removeExperience);

// POST /api/users/education - Add education
router.post('/education', userController.addEducation);

// PUT /api/users/education/:eduId - Update education
router.put('/education/:eduId', userController.updateEducation);

// DELETE /api/users/education/:eduId - Remove education
router.delete('/education/:eduId', userController.removeEducation);

// POST /api/users/certifications - Add certification
router.post('/certifications', userController.addCertification);

// PUT /api/users/certifications/:certId - Update certification
router.put('/certifications/:certId', userController.updateCertification);

// DELETE /api/users/certifications/:certId - Remove certification
router.delete('/certifications/:certId', userController.removeCertification);

// GET /api/users/export-data - Export user data
router.get('/export-data', userController.exportUserData);

// DELETE /api/users/account - Delete user account
router.delete('/account', userController.deleteAccount);

// POST /api/users/feedback - Submit user feedback
router.post('/feedback', userController.submitFeedback);

module.exports = router;
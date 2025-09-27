const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const auth = require('../middleware/auth');
const upload = require('../config/multer');
const { validateResumeCreate, validateResumeUpdate, validateCustomizeRequest } = require('../middleware/validation');

// All resume routes require authentication
router.use(auth);

// GET /api/resumes - Get all user resumes
router.get('/', resumeController.getAllResumes);

// POST /api/resumes - Create new resume
router.post('/', validateResumeCreate, resumeController.createResume);

// GET /api/resumes/templates - Get available resume templates
router.get('/templates', resumeController.getResumeTemplates);

// POST /api/resumes/generate-ai - Generate resume using AI
router.post('/generate-ai', resumeController.generateAIResume);

// POST /api/resumes/customize-for-job - Customize resume for specific job
router.post('/customize-for-job', validateCustomizeRequest, resumeController.customizeResumeForJob);

// POST /api/resumes/upload - Upload existing resume file
router.post('/upload', upload.single('resumeFile'), resumeController.uploadResume);

// GET /api/resumes/vault - Get resume vault (all versions)
router.get('/vault', resumeController.getResumeVault);

// POST /api/resumes/parse - Parse resume from uploaded file
router.post('/parse', upload.single('resumeFile'), resumeController.parseResume);

// GET /api/resumes/suggestions - Get AI suggestions for resume improvement
router.get('/suggestions', resumeController.getResumeSuggestions);

// POST /api/resumes/optimize-keywords - Optimize resume keywords for ATS
router.post('/optimize-keywords', resumeController.optimizeKeywords);

// GET /api/resumes/:id - Get specific resume
router.get('/:id', resumeController.getResumeById);

// PUT /api/resumes/:id - Update resume
router.put('/:id', validateResumeUpdate, resumeController.updateResume);

// DELETE /api/resumes/:id - Delete resume
router.delete('/:id', resumeController.deleteResume);

// POST /api/resumes/:id/duplicate - Duplicate resume
router.post('/:id/duplicate', resumeController.duplicateResume);

// GET /api/resumes/:id/download/pdf - Download resume as PDF
router.get('/:id/download/pdf', resumeController.downloadResumePDF);

// GET /api/resumes/:id/download/docx - Download resume as DOCX
router.get('/:id/download/docx', resumeController.downloadResumeDocx);

// GET /api/resumes/:id/preview - Preview resume (HTML)
router.get('/:id/preview', resumeController.previewResume);

// POST /api/resumes/:id/share - Generate shareable link
router.post('/:id/share', resumeController.shareResume);

// GET /api/resumes/:id/share/:shareToken - Access shared resume
router.get('/:id/share/:shareToken', resumeController.getSharedResume);

// POST /api/resumes/:id/versions - Create new version of resume
router.post('/:id/versions', resumeController.createResumeVersion);

// GET /api/resumes/:id/versions - Get all versions of resume
router.get('/:id/versions', resumeController.getResumeVersions);

// GET /api/resumes/:id/versions/:versionId - Get specific resume version
router.get('/:id/versions/:versionId', resumeController.getResumeVersion);

// PUT /api/resumes/:id/versions/:versionId - Update resume version
router.put('/:id/versions/:versionId', resumeController.updateResumeVersion);

// DELETE /api/resumes/:id/versions/:versionId - Delete resume version
router.delete('/:id/versions/:versionId', resumeController.deleteResumeVersion);

// POST /api/resumes/:id/versions/:versionId/restore - Restore resume version
router.post('/:id/versions/:versionId/restore', resumeController.restoreResumeVersion);

// POST /api/resumes/:id/analyze - Analyze resume with AI
router.post('/:id/analyze', resumeController.analyzeResume);

// POST /api/resumes/:id/score - Get ATS score for resume
router.post('/:id/score', resumeController.getATSScore);

// PUT /api/resumes/:id/template - Change resume template
router.put('/:id/template', resumeController.changeResumeTemplate);

// POST /api/resumes/:id/sections - Add new section to resume
router.post('/:id/sections', resumeController.addResumeSection);

// PUT /api/resumes/:id/sections/:sectionId - Update resume section
router.put('/:id/sections/:sectionId', resumeController.updateResumeSection);

// DELETE /api/resumes/:id/sections/:sectionId - Delete resume section
router.delete('/:id/sections/:sectionId', resumeController.deleteResumeSection);

// POST /api/resumes/:id/sections/reorder - Reorder resume sections
router.post('/:id/sections/reorder', resumeController.reorderResumeSections);

module.exports = router;
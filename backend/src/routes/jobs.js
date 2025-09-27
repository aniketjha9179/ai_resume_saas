const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const auth = require('../middleware/auth');
const upload = require('../config/multer');
const { validateJobApplication, validateJobUpdate, validateBulkAction } = require('../middleware/validation');

// All job routes require authentication
router.use(auth);

// GET /api/jobs - Get all job applications with filtering and pagination
router.get('/', jobController.getAllJobs);

// POST /api/jobs - Create new job application
router.post('/', validateJobApplication, jobController.createJob);

// GET /api/jobs/stats - Get job application statistics
router.get('/stats', jobController.getJobStats);

// GET /api/jobs/recent - Get recent job applications
router.get('/recent', jobController.getRecentJobs);

// GET /api/jobs/search - Search job applications
router.get('/search', jobController.searchJobs);

// POST /api/jobs/bulk-action - Perform bulk actions on jobs
router.post('/bulk-action', validateBulkAction, jobController.bulkAction);

// POST /api/jobs/import - Import jobs from CSV/Excel
router.post('/import', upload.single('jobsFile'), jobController.importJobs);

// GET /api/jobs/export - Export jobs to CSV/Excel
router.get('/export', jobController.exportJobs);

// POST /api/jobs/scrape-linkedin - Scrape job from LinkedIn URL
router.post('/scrape-linkedin', jobController.scrapeLinkedInJob);

// POST /api/jobs/scrape-indeed - Scrape job from Indeed URL
router.post('/scrape-indeed', jobController.scrapeIndeedJob);

// GET /api/jobs/templates - Get job application templates
router.get('/templates', jobController.getJobTemplates);

// POST /api/jobs/templates - Create job application template
router.post('/templates', jobController.createJobTemplate);

// GET /api/jobs/:id - Get specific job application
router.get('/:id', jobController.getJobById);

// PUT /api/jobs/:id - Update job application
router.put('/:id', validateJobUpdate, jobController.updateJob);

// DELETE /api/jobs/:id - Delete job application
router.delete('/:id', jobController.deleteJob);

// POST /api/jobs/:id/status - Update job status
router.post('/:id/status', jobController.updateJobStatus);

// POST /api/jobs/:id/notes - Add note to job application
router.post('/:id/notes', jobController.addJobNote);

// PUT /api/jobs/:id/notes/:noteId - Update job note
router.put('/:id/notes/:noteId', jobController.updateJobNote);

// DELETE /api/jobs/:id/notes/:noteId - Delete job note
router.delete('/:id/notes/:noteId', jobController.deleteJobNote);

// POST /api/jobs/:id/documents - Upload job-related documents
router.post('/:id/documents', upload.array('documents', 5), jobController.uploadJobDocuments);

// DELETE /api/jobs/:id/documents/:docId - Delete job document
router.delete('/:id/documents/:docId', jobController.deleteJobDocument);

// POST /api/jobs/:id/interviews - Add interview details
router.post('/:id/interviews', jobController.addInterview);

// PUT /api/jobs/:id/interviews/:interviewId - Update interview details
router.put('/:id/interviews/:interviewId', jobController.updateInterview);

// DELETE /api/jobs/:id/interviews/:interviewId - Delete interview
router.delete('/:id/interviews/:interviewId', jobController.deleteInterview);

// POST /api/jobs/:id/contacts - Add company contact
router.post('/:id/contacts', jobController.addContact);

// PUT /api/jobs/:id/contacts/:contactId - Update company contact
router.put('/:id/contacts/:contactId', jobController.updateContact);

// DELETE /api/jobs/:id/contacts/:contactId - Delete company contact
router.delete('/:id/contacts/:contactId', jobController.deleteContact);

// POST /api/jobs/:id/archive - Archive job application
router.post('/:id/archive', jobController.archiveJob);

// POST /api/jobs/:id/unarchive - Unarchive job application
router.post('/:id/unarchive', jobController.unarchiveJob);

// POST /api/jobs/:id/duplicate - Duplicate job application
router.post('/:id/duplicate', jobController.duplicateJob);

// GET /api/jobs/:id/timeline - Get job application timeline
router.get('/:id/timeline', jobController.getJobTimeline);

module.exports = router;
const express = require('express');
const router = express.Router();
const reminderController = require('../controllers/reminderController');
const auth = require('../middleware/auth');
const { validateReminderCreate, validateReminderUpdate, validateBulkReminderAction } = require('../middleware/validation');

// All reminder routes require authentication
router.use(auth);

// GET /api/reminders - Get all reminders with filtering and pagination
router.get('/', reminderController.getAllReminders);

// POST /api/reminders - Create new reminder
router.post('/', validateReminderCreate, reminderController.createReminder);

// GET /api/reminders/upcoming - Get upcoming reminders
router.get('/upcoming', reminderController.getUpcomingReminders);

// GET /api/reminders/overdue - Get overdue reminders
router.get('/overdue', reminderController.getOverdueReminders);

// GET /api/reminders/today - Get today's reminders
router.get('/today', reminderController.getTodayReminders);

// GET /api/reminders/this-week - Get this week's reminders
router.get('/this-week', reminderController.getThisWeekReminders);

// POST /api/reminders/bulk-action - Perform bulk actions on reminders
router.post('/bulk-action', validateBulkReminderAction, reminderController.bulkReminderAction);

// GET /api/reminders/templates - Get reminder templates
router.get('/templates', reminderController.getReminderTemplates);

// POST /api/reminders/templates - Create reminder template
router.post('/templates', reminderController.createReminderTemplate);

// POST /api/reminders/auto-generate - Auto-generate reminders for job applications
router.post('/auto-generate', reminderController.autoGenerateReminders);

// GET /api/reminders/stats - Get reminder statistics
router.get('/stats', reminderController.getReminderStats);

// POST /api/reminders/snooze-all - Snooze all pending reminders
router.post('/snooze-all', reminderController.snoozeAllReminders);

// GET /api/reminders/:id - Get specific reminder
router.get('/:id', reminderController.getReminderById);

// PUT /api/reminders/:id - Update reminder
router.put('/:id', validateReminderUpdate, reminderController.updateReminder);

// DELETE /api/reminders/:id - Delete reminder
router.delete('/:id', reminderController.deleteReminder);

// POST /api/reminders/:id/complete - Mark reminder as completed
router.post('/:id/complete', reminderController.completeReminder);

// POST /api/reminders/:id/snooze - Snooze reminder
router.post('/:id/snooze', reminderController.snoozeReminder);

// POST /api/reminders/:id/dismiss - Dismiss reminder
router.post('/:id/dismiss', reminderController.dismissReminder);

// POST /api/reminders/:id/duplicate - Duplicate reminder
router.post('/:id/duplicate', reminderController.duplicateReminder);

// GET /api/reminders/:id/history - Get reminder history
router.get('/:id/history', reminderController.getReminderHistory);

// POST /api/reminders/job/:jobId/follow-up - Create follow-up reminder for job
router.post('/job/:jobId/follow-up', reminderController.createFollowUpReminder);

// POST /api/reminders/job/:jobId/interview - Create interview reminder for job
router.post('/job/:jobId/interview', reminderController.createInterviewReminder);

// POST /api/reminders/job/:jobId/deadline - Create application deadline reminder
router.post('/job/:jobId/deadline', reminderController.createDeadlineReminder);

// GET /api/reminders/job/:jobId - Get all reminders for specific job
router.get('/job/:jobId', reminderController.getJobReminders);

// POST /api/reminders/recurring - Create recurring reminder
router.post('/recurring', reminderController.createRecurringReminder);

// PUT /api/reminders/:id/recurring - Update recurring reminder settings
router.put('/:id/recurring', reminderController.updateRecurringReminder);

// DELETE /api/reminders/:id/recurring - Stop recurring reminder
router.delete('/:id/recurring', reminderController.stopRecurringReminder);

// POST /api/reminders/:id/escalate - Escalate reminder priority
router.post('/:id/escalate', reminderController.escalateReminder);

// GET /api/reminders/calendar/export - Export reminders to calendar
router.get('/calendar/export', reminderController.exportToCalendar);

// POST /api/reminders/import - Import reminders from external source
router.post('/import', reminderController.importReminders);

// GET /api/reminders/notifications/preferences - Get notification preferences
router.get('/notifications/preferences', reminderController.getNotificationPreferences);

// PUT /api/reminders/notifications/preferences - Update notification preferences
router.put('/notifications/preferences', reminderController.updateNotificationPreferences);

module.exports = router;
const Reminder = require('../models/Reminder');
const JobApplication = require('../models/JobApplication');
const emailService = require('../services/emailService');
const { validationResult } = require('express-validator');

const reminderController = {
  // Get all reminders for user
  getReminders: async (req, res) => {
    try {
      const { status = 'all', page = 1, limit = 10 } = req.query;
      
      const query = { userId: req.user.userId };
      if (status !== 'all') {
        query.status = status;
      }

      const reminders = await Reminder.find(query)
        .populate('jobApplicationId', 'jobTitle company')
        .sort({ scheduledDate: 1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Reminder.countDocuments(query);

      res.json({
        success: true,
        data: {
          reminders,
          pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            limit: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get reminders error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get single reminder
  getReminder: async (req, res) => {
    try {
      const reminder = await Reminder.findOne({
        _id: req.params.id,
        userId: req.user.userId
      }).populate('jobApplicationId', 'jobTitle company status');

      if (!reminder) {
        return res.status(404).json({
          success: false,
          message: 'Reminder not found'
        });
      }

      res.json({
        success: true,
        data: { reminder }
      });
    } catch (error) {
      console.error('Get reminder error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Create new reminder
  createReminder: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const reminderData = {
        ...req.body,
        userId: req.user.userId
      };

      // Validate job application exists and belongs to user
      if (reminderData.jobApplicationId) {
        const jobExists = await JobApplication.findOne({
          _id: reminderData.jobApplicationId,
          userId: req.user.userId
        });

        if (!jobExists) {
          return res.status(400).json({
            success: false,
            message: 'Invalid job application ID'
          });
        }
      }

      const reminder = new Reminder(reminderData);
      await reminder.save();

      // Populate job application details
      await reminder.populate('jobApplicationId', 'jobTitle company');

      res.status(201).json({
        success: true,
        message: 'Reminder created successfully',
        data: { reminder }
      });
    } catch (error) {
      console.error('Create reminder error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Update reminder
  updateReminder: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const reminder = await Reminder.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.userId },
        { $set: req.body },
        { new: true, runValidators: true }
      ).populate('jobApplicationId', 'jobTitle company');

      if (!reminder) {
        return res.status(404).json({
          success: false,
          message: 'Reminder not found'
        });
      }

      res.json({
        success: true,
        message: 'Reminder updated successfully',
        data: { reminder }
      });
    } catch (error) {
      console.error('Update reminder error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Mark reminder as completed
  markCompleted: async (req, res) => {
    try {
      const reminder = await Reminder.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.userId },
        { 
          status: 'completed',
          completedDate: new Date()
        },
        { new: true }
      ).populate('jobApplicationId', 'jobTitle company');

      if (!reminder) {
        return res.status(404).json({
          success: false,
          message: 'Reminder not found'
        });
      }

      res.json({
        success: true,
        message: 'Reminder marked as completed',
        data: { reminder }
      });
    } catch (error) {
      console.error('Mark completed error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Snooze reminder
  snoozeReminder: async (req, res) => {
    try {
      const { snoozeMinutes = 60 } = req.body;
      
      const newScheduledDate = new Date();
      newScheduledDate.setMinutes(newScheduledDate.getMinutes() + snoozeMinutes);

      const reminder = await Reminder.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.userId },
        { 
          scheduledDate: newScheduledDate,
          status: 'pending'
        },
        { new: true }
      ).populate('jobApplicationId', 'jobTitle company');

      if (!reminder) {
        return res.status(404).json({
          success: false,
          message: 'Reminder not found'
        });
      }

      res.json({
        success: true,
        message: `Reminder snoozed for ${snoozeMinutes} minutes`,
        data: { reminder }
      });
    } catch (error) {
      console.error('Snooze reminder error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Delete reminder
  deleteReminder: async (req, res) => {
    try {
      const reminder = await Reminder.findOneAndDelete({
        _id: req.params.id,
        userId: req.user.userId
      });

      if (!reminder) {
        return res.status(404).json({
          success: false,
          message: 'Reminder not found'
        });
      }

      res.json({
        success: true,
        message: 'Reminder deleted successfully'
      });
    } catch (error) {
      console.error('Delete reminder error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get upcoming reminders
  getUpcoming: async (req, res) => {
    try {
      const { hours = 24 } = req.query;
      const endDate = new Date();
      endDate.setHours(endDate.getHours() + parseInt(hours));

      const reminders = await Reminder.find({
        userId: req.user.userId,
        status: 'pending',
        scheduledDate: { $lte: endDate }
      })
      .populate('jobApplicationId', 'jobTitle company status')
      .sort({ scheduledDate: 1 });

      res.json({
        success: true,
        data: {
          reminders,
          count: reminders.length,
          timeframe: `${hours} hours`
        }
      });
    } catch (error) {
      console.error('Get upcoming reminders error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get overdue reminders
  getOverdue: async (req, res) => {
    try {
      const now = new Date();
      
      const reminders = await Reminder.find({
        userId: req.user.userId,
        status: 'pending',
        scheduledDate: { $lt: now }
      })
      .populate('jobApplicationId', 'jobTitle company status')
      .sort({ scheduledDate: 1 });

      res.json({
        success: true,
        data: {
          reminders,
          count: reminders.length
        }
      });
    } catch (error) {
      console.error('Get overdue reminders error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Create auto reminders for job application
  createAutoReminders: async (req, res) => {
    try {
      const { jobApplicationId } = req.body;

      // Validate job application
      const jobApp = await JobApplication.findOne({
        _id: jobApplicationId,
        userId: req.user.userId
      });

      if (!jobApp) {
        return res.status(400).json({
          success: false,
          message: 'Invalid job application ID'
        });
      }

      // Create default follow-up reminders
      const reminders = [];
      const baseDate = jobApp.appliedDate || new Date();

      // 1 week follow-up
      const weekReminder = new Reminder({
        userId: req.user.userId,
        jobApplicationId,
        title: 'Follow up on application',
        message: `Follow up on your application for ${jobApp.jobTitle} at ${jobApp.company}`,
        type: 'follow_up',
        scheduledDate: new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000),
        isAutoGenerated: true
      });

      // 2 week follow-up
      const twoWeekReminder = new Reminder({
        userId: req.user.userId,
        jobApplicationId,
        title: 'Second follow-up',
        message: `Second follow-up on your application for ${jobApp.jobTitle} at ${jobApp.company}`,
        type: 'follow_up',
        scheduledDate: new Date(baseDate.getTime() + 14 * 24 * 60 * 60 * 1000),
        isAutoGenerated: true
      });

      await Promise.all([
        weekReminder.save(),
        twoWeekReminder.save()
      ]);

      reminders.push(weekReminder, twoWeekReminder);

      res.status(201).json({
        success: true,
        message: 'Auto reminders created successfully',
        data: { reminders }
      });
    } catch (error) {
      console.error('Create auto reminders error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Bulk operations on reminders
  bulkOperation: async (req, res) => {
    try {
      const { reminderIds, operation, data = {} } = req.body;

      let result;
      switch (operation) {
        case 'complete':
          result = await Reminder.updateMany(
            {
              _id: { $in: reminderIds },
              userId: req.user.userId
            },
            {
              status: 'completed',
              completedDate: new Date()
            }
          );
          break;

        case 'delete':
          result = await Reminder.deleteMany({
            _id: { $in: reminderIds },
            userId: req.user.userId
          });
          break;

        case 'snooze':
          const snoozeDate = new Date();
          snoozeDate.setMinutes(snoozeDate.getMinutes() + (data.minutes || 60));
          
          result = await Reminder.updateMany(
            {
              _id: { $in: reminderIds },
              userId: req.user.userId
            },
            {
              scheduledDate: snoozeDate,
              status: 'pending'
            }
          );
          break;

        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid bulk operation'
          });
      }

      res.json({
        success: true,
        message: `Bulk ${operation} completed`,
        data: {
          modifiedCount: result.modifiedCount || result.deletedCount,
          operation
        }
      });
    } catch (error) {
      console.error('Bulk operation error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

module.exports = reminderController;

const JobApplication = require('../models/JobApplication');
const { validationResult } = require('express-validator');

const jobController = {
  // Get all job applications for user
  getJobs: async (req, res) => {
    try {
      const { page = 1, limit = 10, status, company, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
      
      const query = { userId: req.user.userId };
      
      // Add filters
      if (status) query.status = status;
      if (company) query.company = new RegExp(company, 'i');

      const jobs = await JobApplication.find(query)
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate('resumeUsed', 'name version');

      const total = await JobApplication.countDocuments(query);

      res.json({
        success: true,
        data: {
          jobs,
          pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            limit: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get jobs error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get single job application
  getJob: async (req, res) => {
    try {
      const job = await JobApplication.findOne({
        _id: req.params.id,
        userId: req.user.userId
      }).populate('resumeUsed', 'name version filePath');

      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job application not found'
        });
      }

      res.json({
        success: true,
        data: { job }
      });
    } catch (error) {
      console.error('Get job error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Create new job application
  createJob: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const jobData = {
        ...req.body,
        userId: req.user.userId
      };

      const job = new JobApplication(jobData);
      await job.save();

      res.status(201).json({
        success: true,
        message: 'Job application created successfully',
        data: { job }
      });
    } catch (error) {
      console.error('Create job error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Update job application
  updateJob: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const job = await JobApplication.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.userId },
        { $set: req.body },
        { new: true, runValidators: true }
      );

      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job application not found'
        });
      }

      res.json({
        success: true,
        message: 'Job application updated successfully',
        data: { job }
      });
    } catch (error) {
      console.error('Update job error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Delete job application
  deleteJob: async (req, res) => {
    try {
      const job = await JobApplication.findOneAndDelete({
        _id: req.params.id,
        userId: req.user.userId
      });

      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job application not found'
        });
      }

      res.json({
        success: true,
        message: 'Job application deleted successfully'
      });
    } catch (error) {
      console.error('Delete job error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get job statistics
  getJobStats: async (req, res) => {
    try {
      const stats = await JobApplication.aggregate([
        { $match: { userId: req.user.userId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const total = await JobApplication.countDocuments({ userId: req.user.userId });

      res.json({
        success: true,
        data: {
          total,
          byStatus: stats.reduce((acc, stat) => {
            acc[stat._id] = stat.count;
            return acc;
          }, {})
        }
      });
    } catch (error) {
      console.error('Get job stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Bulk update job applications
  bulkUpdate: async (req, res) => {
    try {
      const { jobIds, updates } = req.body;

      const result = await JobApplication.updateMany(
        {
          _id: { $in: jobIds },
          userId: req.user.userId
        },
        { $set: updates }
      );

      res.json({
        success: true,
        message: `${result.modifiedCount} job applications updated`,
        data: { modifiedCount: result.modifiedCount }
      });
    } catch (error) {
      console.error('Bulk update error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

module.exports = jobController;

const Resume = require('../models/Resume');
const aiService = require('../services/aiService');
const pdfService = require('../services/pdfService');
const { validationResult } = require('express-validator');
const fs = require('fs').promises;
const path = require('path');

const resumeController = {
  // Get all resumes for user
  getResumes: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      
      const resumes = await Resume.find({ userId: req.user.userId })
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Resume.countDocuments({ userId: req.user.userId });

      res.json({
        success: true,
        data: {
          resumes,
          pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            limit: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get resumes error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get single resume
  getResume: async (req, res) => {
    try {
      const resume = await Resume.findOne({
        _id: req.params.id,
        userId: req.user.userId
      });

      if (!resume) {
        return res.status(404).json({
          success: false,
          message: 'Resume not found'
        });
      }

      res.json({
        success: true,
        data: { resume }
      });
    } catch (error) {
      console.error('Get resume error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Generate AI-powered resume
  generateResume: async (req, res) => {
    try {
      const { jobDescription, targetRole, templateId } = req.body;
      
      // Get user profile for context
      const User = require('../models/User');
      const user = await User.findById(req.user.userId);

      // Use AI service to generate optimized resume content
      const optimizedContent = await aiService.generateResume({
        userProfile: user.profile,
        jobDescription,
        targetRole
      });

      // Create resume record
      const resume = new Resume({
        userId: req.user.userId,
        name: `Resume for ${targetRole}`,
        content: optimizedContent,
        templateId: templateId || 'default',
        metadata: {
          targetRole,
          jobDescription: jobDescription.substring(0, 500), // Store first 500 chars
          generatedAt: new Date()
        }
      });

      await resume.save();

      res.status(201).json({
        success: true,
        message: 'Resume generated successfully',
        data: { resume }
      });
    } catch (error) {
      console.error('Generate resume error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate resume'
      });
    }
  },

  // Create manual resume
  createResume: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const resumeData = {
        ...req.body,
        userId: req.user.userId
      };

      const resume = new Resume(resumeData);
      await resume.save();

      res.status(201).json({
        success: true,
        message: 'Resume created successfully',
        data: { resume }
      });
    } catch (error) {
      console.error('Create resume error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Update resume
  updateResume: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const resume = await Resume.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.userId },
        { $set: req.body },
        { new: true, runValidators: true }
      );

      if (!resume) {
        return res.status(404).json({
          success: false,
          message: 'Resume not found'
        });
      }

      res.json({
        success: true,
        message: 'Resume updated successfully',
        data: { resume }
      });
    } catch (error) {
      console.error('Update resume error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Generate PDF from resume
  generatePDF: async (req, res) => {
    try {
      const resume = await Resume.findOne({
        _id: req.params.id,
        userId: req.user.userId
      });

      if (!resume) {
        return res.status(404).json({
          success: false,
          message: 'Resume not found'
        });
      }

      // Generate PDF using PDF service
      const pdfBuffer = await pdfService.generateResumePDF(resume);
      
      // Save PDF file
      const fileName = `resume_${resume._id}_${Date.now()}.pdf`;
      const filePath = path.join('uploads', 'resumes', fileName);
      
      // Ensure directory exists
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, pdfBuffer);

      // Update resume with PDF path
      resume.filePath = filePath;
      await resume.save();

      res.json({
        success: true,
        message: 'PDF generated successfully',
        data: {
          downloadUrl: `/api/resumes/${req.params.id}/download`,
          filePath
        }
      });
    } catch (error) {
      console.error('Generate PDF error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate PDF'
      });
    }
  },

  // Download resume PDF
  downloadPDF: async (req, res) => {
    try {
      const resume = await Resume.findOne({
        _id: req.params.id,
        userId: req.user.userId
      });

      if (!resume || !resume.filePath) {
        return res.status(404).json({
          success: false,
          message: 'Resume PDF not found'
        });
      }

      res.download(resume.filePath, `${resume.name}.pdf`);
    } catch (error) {
      console.error('Download PDF error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to download PDF'
      });
    }
  },

  // Delete resume
  deleteResume: async (req, res) => {
    try {
      const resume = await Resume.findOneAndDelete({
        _id: req.params.id,
        userId: req.user.userId
      });

      if (!resume) {
        return res.status(404).json({
          success: false,
          message: 'Resume not found'
        });
      }

      // Delete PDF file if exists
      if (resume.filePath) {
        try {
          await fs.unlink(resume.filePath);
        } catch (err) {
          console.log('Could not delete PDF file:', err);
        }
      }

      res.json({
        success: true,
        message: 'Resume deleted successfully'
      });
    } catch (error) {
      console.error('Delete resume error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Clone resume
  cloneResume: async (req, res) => {
    try {
      const originalResume = await Resume.findOne({
        _id: req.params.id,
        userId: req.user.userId
      });

      if (!originalResume) {
        return res.status(404).json({
          success: false,
          message: 'Resume not found'
        });
      }

      const clonedResume = new Resume({
        ...originalResume.toObject(),
        _id: undefined,
        name: `${originalResume.name} (Copy)`,
        filePath: null,
        createdAt: undefined,
        updatedAt: undefined
      });

      await clonedResume.save();

      res.status(201).json({
        success: true,
        message: 'Resume cloned successfully',
        data: { resume: clonedResume }
      });
    } catch (error) {
      console.error('Clone resume error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

module.exports = resumeController;

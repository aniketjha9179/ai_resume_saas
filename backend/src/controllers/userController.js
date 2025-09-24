const User = require('../models/User');
const { validationResult } = require('express-validator');

const userController = {
  // Get user profile
  getProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user.userId).select('-password');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Update user profile
  updateProfile: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const updates = req.body;
      const user = await User.findByIdAndUpdate(
        req.user.userId,
        { $set: updates },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Upload profile picture
  uploadProfilePicture: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const user = await User.findByIdAndUpdate(
        req.user.userId,
        { profilePicture: req.file.path },
        { new: true }
      ).select('-password');

      res.json({
        success: true,
        message: 'Profile picture uploaded successfully',
        data: { 
          user,
          profilePicture: req.file.path 
        }
      });
    } catch (error) {
      console.error('Upload profile picture error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Update user skills
  updateSkills: async (req, res) => {
    try {
      const { skills } = req.body;
      
      const user = await User.findByIdAndUpdate(
        req.user.userId,
        { 'profile.skills': skills },
        { new: true }
      ).select('-password');

      res.json({
        success: true,
        message: 'Skills updated successfully',
        data: { user }
      });
    } catch (error) {
      console.error('Update skills error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Add experience
  addExperience: async (req, res) => {
    try {
      const experienceData = req.body;
      
      const user = await User.findByIdAndUpdate(
        req.user.userId,
        { $push: { 'profile.experience': experienceData } },
        { new: true }
      ).select('-password');

      res.json({
        success: true,
        message: 'Experience added successfully',
        data: { user }
      });
    } catch (error) {
      console.error('Add experience error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Delete user account
  deleteAccount: async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.user.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Also delete related data (jobs, resumes, etc.)
      // This should be done in a transaction or background job

      res.json({
        success: true,
        message: 'Account deleted successfully'
      });
    } catch (error) {
      console.error('Delete account error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

module.exports = userController;

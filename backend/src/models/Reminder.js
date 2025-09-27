const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  jobApplicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobApplication',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  reminderDate: {
    type: Date,
    required: true,
    index: true
  },
  reminderType: {
    type: String,
    enum: ['follow_up', 'interview_prep', 'application_deadline', 'custom', 'thank_you_note', 'status_check'],
    default: 'follow_up'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'snoozed', 'cancelled'],
    default: 'pending',
    index: true
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    type: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'weekly'
    },
    interval: {
      type: Number,
      default: 1,
      min: 1
    },
    endDate: {
      type: Date
    }
  },
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    }
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  snoozeUntil: {
    type: Date
  },
  notes: {
    type: String,
    maxlength: 500
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  attachments: [{
    fileName: String,
    filePath: String,
    fileSize: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
reminderSchema.index({ userId: 1, reminderDate: 1 });
reminderSchema.index({ userId: 1, status: 1 });
reminderSchema.index({ reminderDate: 1, status: 1 });
reminderSchema.index({ userId: 1, reminderType: 1 });

// Virtual for checking if reminder is overdue
reminderSchema.virtual('isOverdue').get(function() {
  return this.status === 'pending' && this.reminderDate < new Date();
});

// Virtual for days until reminder
reminderSchema.virtual('daysUntilReminder').get(function() {
  const now = new Date();
  const reminderDate = new Date(this.reminderDate);
  const diffTime = reminderDate - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Static method to get pending reminders for a user
reminderSchema.statics.getPendingReminders = function(userId, limit = 10) {
  return this.find({
    userId: userId,
    status: 'pending',
    reminderDate: { $lte: new Date() }
  })
  .populate('jobApplicationId', 'companyName position')
  .sort({ reminderDate: 1, priority: -1 })
  .limit(limit);
};

// Static method to get upcoming reminders
reminderSchema.statics.getUpcomingReminders = function(userId, days = 7) {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);
  
  return this.find({
    userId: userId,
    status: 'pending',
    reminderDate: { 
      $gte: new Date(),
      $lte: endDate
    }
  })
  .populate('jobApplicationId', 'companyName position')
  .sort({ reminderDate: 1 });
};

// Instance method to mark as completed
reminderSchema.methods.markCompleted = function(notes) {
  this.status = 'completed';
  this.completedAt = new Date();
  if (notes) this.notes = notes;
  return this.save();
};

// Instance method to snooze reminder
reminderSchema.methods.snooze = function(hours = 24) {
  const snoozeDate = new Date();
  snoozeDate.setHours(snoozeDate.getHours() + hours);
  
  this.status = 'snoozed';
  this.snoozeUntil = snoozeDate;
  this.reminderDate = snoozeDate;
  return this.save();
};

// Pre-save middleware to handle recurring reminders
reminderSchema.pre('save', function(next) {
  // If marking as completed and it's a recurring reminder, create next occurrence
  if (this.isModified('status') && this.status === 'completed' && this.isRecurring) {
    const nextDate = new Date(this.reminderDate);
    
    switch (this.recurringPattern.type) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + this.recurringPattern.interval);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + (7 * this.recurringPattern.interval));
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + this.recurringPattern.interval);
        break;
    }
    
    // Check if next occurrence is before end date
    if (!this.recurringPattern.endDate || nextDate <= this.recurringPattern.endDate) {
      // Create next occurrence
      const nextReminder = new this.constructor({
        userId: this.userId,
        jobApplicationId: this.jobApplicationId,
        title: this.title,
        description: this.description,
        reminderDate: nextDate,
        reminderType: this.reminderType,
        priority: this.priority,
        isRecurring: this.isRecurring,
        recurringPattern: this.recurringPattern,
        notifications: this.notifications,
        tags: this.tags
      });
      
      nextReminder.save().catch(console.error);
    }
  }
  
  next();
});

// Pre-find middleware to handle snoozed reminders
reminderSchema.pre(/^find/, function() {
  // Update snoozed reminders that are ready to be active again
  const now = new Date();
  this.model.updateMany(
    {
      status: 'snoozed',
      snoozeUntil: { $lte: now }
    },
    {
      $set: { status: 'pending' },
      $unset: { snoozeUntil: 1 }
    }
  ).exec();
});

module.exports = mongoose.model('Reminder', reminderSchema);
const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
  // User Reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  
  // Job Details
  jobTitle: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [200, 'Job title cannot exceed 200 characters']
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  companyWebsite: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.*/, 'Please enter a valid URL']
  },
  companyLogo: {
    type: String,
    default: null
  },
  
  // Location & Remote Options
  location: {
    city: String,
    state: String,
    country: {
      type: String,
      default: 'India'
    },
    isRemote: {
      type: Boolean,
      default: false
    },
    remoteType: {
      type: String,
      enum: ['Fully Remote', 'Hybrid', 'On-site'],
      default: 'On-site'
    }
  },
  
  // Job Specifications
  jobType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship', 'Temporary'],
    required: [true, 'Job type is required'],
    default: 'Full-time'
  },
  experienceLevel: {
    type: String,
    enum: ['Entry Level', 'Mid Level', 'Senior Level', 'Executive', 'Not Specified'],
    default: 'Not Specified'
  },
  department: {
    type: String,
    trim: true,
    maxlength: [100, 'Department cannot exceed 100 characters']
  },
  
  // Salary Information
  salary: {
    min: {
      type: Number,
      min: [0, 'Minimum salary cannot be negative']
    },
    max: {
      type: Number,
      min: [0, 'Maximum salary cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD']
    },
    period: {
      type: String,
      enum: ['Per Hour', 'Per Month', 'Per Year', 'Fixed Amount'],
      default: 'Per Year'
    },
    isNegotiable: {
      type: Boolean,
      default: false
    }
  },
  
  // Application Details
  applicationDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  applicationDeadline: {
    type: Date,
    validate: {
      validator: function(deadline) {
        return !deadline || deadline >= this.applicationDate;
      },
      message: 'Application deadline must be after application date'
    }
  },
  
  // Application Status Tracking
  status: {
    type: String,
    enum: [
      'Wishlist',           // Want to apply
      'Applied',            // Application submitted
      'Under Review',       // Application being reviewed
      'Phone Screen',       // Initial phone/video call
      'Technical Test',     // Coding/technical assessment
      'First Interview',    // First round interview
      'Second Interview',   // Second round interview
      'Final Interview',    // Final round interview
      'Reference Check',    // Checking references
      'Offer Extended',     // Job offer made
      'Offer Accepted',     // Offer accepted
      'Offer Rejected',     // Offer declined
      'Rejected',           // Application rejected
      'Withdrawn',          // Application withdrawn
      'On Hold'            // Application on hold
    ],
    default: 'Applied',
    required: true
  },
  
  // Status Timeline
  statusHistory: [{
    status: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      maxlength: [500, 'Status notes cannot exceed 500 characters']
    },
    addedBy: {
      type: String,
      default: 'User'
    }
  }],
  
  // Source & Platform
  source: {
    platform: {
      type: String,
      enum: [
        'LinkedIn', 'Indeed', 'Naukri', 'AngelList', 'Glassdoor', 
        'Monster', 'CareerBuilder', 'Company Website', 'Referral', 
        'Job Fair', 'Recruiter', 'Other'
      ],
      default: 'Other'
    },
    jobPostUrl: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.*/, 'Please enter a valid URL']
    },
    referralSource: {
      name: String,
      relationship: String,
      contactInfo: String
    }
  },
  
  // Contact Information
  contacts: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    title: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
      trim: true
    },
    linkedin: {
      type: String,
      trim: true
    },
    role: {
      type: String,
      enum: ['HR', 'Recruiter', 'Hiring Manager', 'Team Lead', 'Other'],
      default: 'Other'
    },
    notes: {
      type: String,
      maxlength: [500, 'Contact notes cannot exceed 500 characters']
    }
  }],
  
  // Interview Information
  interviews: [{
    type: {
      type: String,
      enum: ['Phone', 'Video', 'In-person', 'Technical', 'Panel', 'Group'],
      required: true
    },
    scheduledDate: {
      type: Date,
      required: true
    },
    duration: {
      type: Number, // in minutes
      min: [1, 'Duration must be at least 1 minute']
    },
    interviewer: {
      name: String,
      title: String,
      email: String
    },
    location: String,
    meetingLink: String,
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled', 'No Show'],
      default: 'Scheduled'
    },
    feedback: {
      type: String,
      maxlength: [1000, 'Interview feedback cannot exceed 1000 characters']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    questions: [{
      question: String,
      answer: String,
      category: {
        type: String,
        enum: ['Technical', 'Behavioral', 'Cultural Fit', 'Experience', 'Other']
      }
    }],
    notes: {
      type: String,
      maxlength: [1000, 'Interview notes cannot exceed 1000 characters']
    }
  }],
  
  // Documents & Files
  documents: {
    resume: {
      filename: String,
      originalName: String,
      path: String,
      uploadDate: {
        type: Date,
        default: Date.now
      }
    },
    coverLetter: {
      filename: String,
      originalName: String,
      path: String,
      uploadDate: {
        type: Date,
        default: Date.now
      }
    },
    portfolio: {
      filename: String,
      originalName: String,
      path: String,
      uploadDate: {
        type: Date,
        default: Date.now
      }
    },
    otherDocuments: [{
      filename: String,
      originalName: String,
      path: String,
      documentType: String,
      uploadDate: {
        type: Date,
        default: Date.now
      }
    }]
  },
  
  // Job Description & Requirements
  jobDescription: {
    type: String,
    maxlength: [5000, 'Job description cannot exceed 5000 characters']
  },
  requirements: [String],
  skillsRequired: [String],
  benefits: [String],
  
  // Application Notes & Research
  notes: {
    type: String,
    maxlength: [2000, 'Notes cannot exceed 2000 characters']
  },
  researchNotes: {
    type: String,
    maxlength: [1000, 'Research notes cannot exceed 1000 characters']
  },
  
  // Priority & Tags
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  
  // Follow-up & Reminders
  followUpDate: Date,
  lastFollowUpDate: Date,
  followUpCount: {
    type: Number,
    default: 0
  },
  
  // AI Generated Insights
  aiInsights: {
    matchScore: {
      type: Number,
      min: 0,
      max: 100
    },
    skillsMatch: [String],
    missingSkills: [String],
    suggestions: [String],
    generatedAt: Date
  },
  
  // Application Analytics
  analytics: {
    viewCount: {
      type: Number,
      default: 0
    },
    lastViewedAt: Date,
    timeSpentInStatus: [{
      status: String,
      duration: Number, // in days
      startDate: Date,
      endDate: Date
    }]
  },
  
  // Archive Status
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: Date,
  archivedReason: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for days since application
jobApplicationSchema.virtual('daysSinceApplication').get(function() {
  const now = new Date();
  const appDate = new Date(this.applicationDate);
  const diffTime = Math.abs(now - appDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for status duration
jobApplicationSchema.virtual('currentStatusDuration').get(function() {
  if (!this.statusHistory || this.statusHistory.length === 0) return 0;
  
  const latestStatus = this.statusHistory[this.statusHistory.length - 1];
  const now = new Date();
  const statusDate = new Date(latestStatus.date);
  const diffTime = Math.abs(now - statusDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for next interview
jobApplicationSchema.virtual('nextInterview').get(function() {
  if (!this.interviews || this.interviews.length === 0) return null;
  
  const now = new Date();
  const upcomingInterviews = this.interviews
    .filter(interview => 
      interview.status === 'Scheduled' && 
      new Date(interview.scheduledDate) > now
    )
    .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
  
  return upcomingInterviews.length > 0 ? upcomingInterviews[0] : null;
});

// Indexes for better performance
jobApplicationSchema.index({ userId: 1, createdAt: -1 });
jobApplicationSchema.index({ userId: 1, status: 1 });
jobApplicationSchema.index({ applicationDate: -1 });
jobApplicationSchema.index({ company: 'text', jobTitle: 'text' });
jobApplicationSchema.index({ followUpDate: 1 });
jobApplicationSchema.index({ 'interviews.scheduledDate': 1 });

// Pre-save middleware to update status history
jobApplicationSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    // Add to status history if status changed
    const existingStatus = this.statusHistory.find(
      history => history.status === this.status
    );
    
    if (!existingStatus) {
      this.statusHistory.push({
        status: this.status,
        date: new Date(),
        addedBy: 'User'
      });
    }
  }
  
  // Update view analytics
  if (this.isModified('analytics.viewCount')) {
    this.analytics.lastViewedAt = new Date();
  }
  
  next();
});

// Method to add status update
jobApplicationSchema.methods.updateStatus = function(newStatus, notes = '', addedBy = 'User') {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    date: new Date(),
    notes: notes,
    addedBy: addedBy
  });
  
  return this.save();
};

// Method to add interview
jobApplicationSchema.methods.addInterview = function(interviewData) {
  this.interviews.push(interviewData);
  return this.save();
};

// Method to increment view count
jobApplicationSchema.methods.incrementViewCount = function() {
  this.analytics.viewCount += 1;
  this.analytics.lastViewedAt = new Date();
  return this.save();
};

// Method to check if follow-up is needed
jobApplicationSchema.methods.needsFollowUp = function() {
  if (!this.followUpDate) return false;
  return new Date() >= new Date(this.followUpDate);
};

// Static method to get applications needing follow-up
jobApplicationSchema.statics.getNeedingFollowUp = function(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return this.find({
    userId: userId,
    followUpDate: { $lte: today },
    status: { 
      $nin: ['Offer Accepted', 'Rejected', 'Withdrawn', 'Offer Rejected'] 
    },
    isArchived: false
  });
};

// Static method to get application statistics
jobApplicationSchema.statics.getApplicationStats = function(userId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        applicationDate: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

module.exports = mongoose.model('JobApplication', jobApplicationSchema);
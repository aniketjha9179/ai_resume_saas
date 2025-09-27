const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  
  // Job Application Analytics
  jobApplicationStats: {
    totalApplications: {
      type: Number,
      default: 0
    },
    appliedCount: {
      type: Number,
      default: 0
    },
    interviewingCount: {
      type: Number,
      default: 0
    },
    offeredCount: {
      type: Number,
      default: 0
    },
    rejectedCount: {
      type: Number,
      default: 0
    },
    pendingCount: {
      type: Number,
      default: 0
    },
    withdrawnCount: {
      type: Number,
      default: 0
    }
  },

  // Monthly breakdown
  monthlyApplications: [{
    month: {
      type: String, // Format: 'YYYY-MM'
      required: true
    },
    count: {
      type: Number,
      default: 0
    },
    interviews: {
      type: Number,
      default: 0
    },
    offers: {
      type: Number,
      default: 0
    },
    rejections: {
      type: Number,
      default: 0
    }
  }],

  // Success rates and conversion metrics
  conversionRates: {
    applicationToInterview: {
      type: Number,
      default: 0 // Percentage
    },
    interviewToOffer: {
      type: Number,
      default: 0 // Percentage
    },
    overallSuccessRate: {
      type: Number,
      default: 0 // Percentage
    }
  },

  // Response time analytics
  responseTimeAnalytics: {
    averageResponseTime: {
      type: Number, // Days
      default: 0
    },
    fastestResponse: {
      type: Number, // Days
      default: null
    },
    slowestResponse: {
      type: Number, // Days
      default: null
    }
  },

  // Industry and job type breakdown
  industryBreakdown: [{
    industry: {
      type: String,
      required: true
    },
    count: {
      type: Number,
      default: 0
    },
    successRate: {
      type: Number,
      default: 0
    }
  }],

  jobTypeBreakdown: [{
    jobType: {
      type: String, // full-time, part-time, contract, internship
      required: true
    },
    count: {
      type: Number,
      default: 0
    }
  }],

  // Location analytics
  locationBreakdown: [{
    location: {
      city: String,
      state: String,
      country: String,
      isRemote: {
        type: Boolean,
        default: false
      }
    },
    count: {
      type: Number,
      default: 0
    }
  }],

  // Salary analytics
  salaryAnalytics: {
    averageMinSalary: {
      type: Number,
      default: 0
    },
    averageMaxSalary: {
      type: Number,
      default: 0
    },
    highestOffer: {
      type: Number,
      default: 0
    },
    lowestOffer: {
      type: Number,
      default: 0
    }
  },

  // Application source tracking
  applicationSources: [{
    source: {
      type: String, // LinkedIn, Indeed, Company Website, etc.
      required: true
    },
    count: {
      type: Number,
      default: 0
    },
    successRate: {
      type: Number,
      default: 0
    }
  }],

  // Resume analytics
  resumeStats: {
    totalResumes: {
      type: Number,
      default: 0
    },
    mostUsedResume: {
      resumeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resume'
      },
      usageCount: {
        type: Number,
        default: 0
      }
    },
    resumeSuccessRates: [{
      resumeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resume'
      },
      applicationsCount: {
        type: Number,
        default: 0
      },
      successRate: {
        type: Number,
        default: 0
      }
    }]
  },

  // Activity tracking
  activityStats: {
    averageApplicationsPerWeek: {
      type: Number,
      default: 0
    },
    mostActiveDay: {
      type: String, // Monday, Tuesday, etc.
      default: null
    },
    mostActiveMonth: {
      type: String, // January, February, etc.
      default: null
    },
    longestStreak: {
      type: Number, // Days
      default: 0
    },
    currentStreak: {
      type: Number, // Days
      default: 0
    }
  },

  // Goals and targets
  goals: {
    monthlyApplicationTarget: {
      type: Number,
      default: 0
    },
    currentMonthProgress: {
      type: Number,
      default: 0
    },
    yearlyTarget: {
      type: Number,
      default: 0
    },
    currentYearProgress: {
      type: Number,
      default: 0
    }
  },

  // Interview analytics
  interviewStats: {
    totalInterviews: {
      type: Number,
      default: 0
    },
    averageInterviewsPerApplication: {
      type: Number,
      default: 0
    },
    interviewTypes: [{
      type: {
        type: String, // phone, video, onsite, technical
        required: true
      },
      count: {
        type: Number,
        default: 0
      },
      successRate: {
        type: Number,
        default: 0
      }
    }]
  },

  // Reminder and follow-up analytics
  reminderStats: {
    totalReminders: {
      type: Number,
      default: 0
    },
    completedReminders: {
      type: Number,
      default: 0
    },
    overdueReminders: {
      type: Number,
      default: 0
    },
    averageResponseTimeAfterReminder: {
      type: Number, // Days
      default: 0
    }
  },

  // Time-based analytics
  timeAnalytics: {
    averageJobSearchDuration: {
      type: Number, // Days
      default: 0
    },
    quickestHire: {
      type: Number, // Days
      default: null
    },
    longestJobSearch: {
      type: Number, // Days
      default: null
    }
  },

  // Last updated timestamp
  lastCalculated: {
    type: Date,
    default: Date.now
  },

  // Data freshness indicator
  isStale: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
analyticsSchema.index({ userId: 1 });
analyticsSchema.index({ lastCalculated: 1 });
analyticsSchema.index({ 'monthlyApplications.month': 1 });

// Virtual for current month applications
analyticsSchema.virtual('currentMonthApplications').get(function() {
  const currentMonth = new Date().toISOString().slice(0, 7); // 'YYYY-MM'
  const monthData = this.monthlyApplications.find(m => m.month === currentMonth);
  return monthData ? monthData.count : 0;
});

// Virtual for success rate calculation
analyticsSchema.virtual('overallConversionRate').get(function() {
  if (this.jobApplicationStats.totalApplications === 0) return 0;
  return (this.jobApplicationStats.offeredCount / this.jobApplicationStats.totalApplications * 100).toFixed(2);
});

// Static method to initialize analytics for new user
analyticsSchema.statics.initializeForUser = function(userId) {
  return this.create({
    userId: userId,
    monthlyApplications: [],
    industryBreakdown: [],
    jobTypeBreakdown: [],
    locationBreakdown: [],
    applicationSources: []
  });
};

// Static method to update analytics for a user
analyticsSchema.statics.updateUserAnalytics = async function(userId) {
  const JobApplication = mongoose.model('JobApplication');
  const Resume = mongoose.model('Resume');
  const Reminder = mongoose.model('Reminder');
  
  try {
    // Get all job applications for the user
    const applications = await JobApplication.find({ userId }).lean();
    const resumes = await Resume.find({ userId }).lean();
    const reminders = await Reminder.find({ userId }).lean();
    
    // Calculate basic stats
    const stats = {
      totalApplications: applications.length,
      appliedCount: applications.filter(app => app.status === 'applied').length,
      interviewingCount: applications.filter(app => app.status === 'interviewing').length,
      offeredCount: applications.filter(app => app.status === 'offered').length,
      rejectedCount: applications.filter(app => app.status === 'rejected').length,
      pendingCount: applications.filter(app => app.status === 'pending').length,
      withdrawnCount: applications.filter(app => app.status === 'withdrawn').length
    };
    
    // Calculate conversion rates
    const conversionRates = {
      applicationToInterview: stats.totalApplications > 0 ? 
        (stats.interviewingCount / stats.totalApplications * 100) : 0,
      interviewToOffer: stats.interviewingCount > 0 ? 
        (stats.offeredCount / stats.interviewingCount * 100) : 0,
      overallSuccessRate: stats.totalApplications > 0 ? 
        (stats.offeredCount / stats.totalApplications * 100) : 0
    };
    
    // Calculate monthly breakdown
    const monthlyBreakdown = {};
    applications.forEach(app => {
      const month = new Date(app.applicationDate).toISOString().slice(0, 7);
      if (!monthlyBreakdown[month]) {
        monthlyBreakdown[month] = { count: 0, interviews: 0, offers: 0, rejections: 0 };
      }
      monthlyBreakdown[month].count++;
      if (app.status === 'interviewing') monthlyBreakdown[month].interviews++;
      if (app.status === 'offered') monthlyBreakdown[month].offers++;
      if (app.status === 'rejected') monthlyBreakdown[month].rejections++;
    });
    
    const monthlyApplications = Object.keys(monthlyBreakdown).map(month => ({
      month,
      ...monthlyBreakdown[month]
    })).sort((a, b) => a.month.localeCompare(b.month));
    
    // Update or create analytics record
    const analytics = await this.findOneAndUpdate(
      { userId },
      {
        jobApplicationStats: stats,
        conversionRates,
        monthlyApplications,
        lastCalculated: new Date(),
        isStale: false
      },
      { upsert: true, new: true }
    );
    
    return analytics;
    
  } catch (error) {
    console.error('Error updating user analytics:', error);
    throw error;
  }
};

// Instance method to mark analytics as stale
analyticsSchema.methods.markStale = function() {
  this.isStale = true;
  return this.save();
};

// Instance method to check if analytics need refresh
analyticsSchema.methods.needsRefresh = function() {
  const hoursSinceUpdate = (Date.now() - this.lastCalculated) / (1000 * 60 * 60);
  return this.isStale || hoursSinceUpdate > 24; // Refresh if stale or older than 24 hours
};

// Pre-save middleware to calculate derived fields
analyticsSchema.pre('save', function(next) {
  // Calculate overall success rate
  if (this.jobApplicationStats.totalApplications > 0) {
    this.conversionRates.overallSuccessRate = 
      (this.jobApplicationStats.offeredCount / this.jobApplicationStats.totalApplications * 100);
  }
  
  // Calculate current streak and goals progress
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthData = this.monthlyApplications.find(m => m.month === currentMonth);
  
  if (this.goals.monthlyApplicationTarget > 0 && currentMonthData) {
    this.goals.currentMonthProgress = (currentMonthData.count / this.goals.monthlyApplicationTarget * 100);
  }
  
  next();
});

module.exports = mongoose.model('Analytics', analyticsSchema);
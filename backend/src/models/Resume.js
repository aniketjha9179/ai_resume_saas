const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  // User Reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  
  // Resume Identification
  title: {
    type: String,
    required: [true, 'Resume title is required'],
    trim: true,
    maxlength: [100, 'Resume title cannot exceed 100 characters']
  },
  version: {
    type: String,
    required: [true, 'Version is required'],
    trim: true,
    default: '1.0'
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    trim: true
  },
  
  // Resume Type & Template
  type: {
    type: String,
    enum: ['Master', 'Tailored', 'Template', 'AI Generated'],
    required: true,
    default: 'Master'
  },
  templateId: {
    type: String,
    trim: true
  },
  templateName: {
    type: String,
    trim: true
  },
  
  // Personal Information Section
  personalInfo: {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[0-9+\-\s()]+$/, 'Please enter a valid phone number']
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: {
        type: String,
        default: 'India'
      }
    },
    website: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.*/, 'Please enter a valid URL']
    },
    linkedin: {
      type: String,
      trim: true,
      match: [/^https?:\/\/(www\.)?linkedin\.com\/.*/, 'Please enter a valid LinkedIn URL']
    },
    github: {
      type: String,
      trim: true,
      match: [/^https?:\/\/(www\.)?github\.com\/.*/, 'Please enter a valid GitHub URL']
    },
    portfolio: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.*/, 'Please enter a valid URL']
    }
  },
  
  // Professional Summary
  summary: {
    type: String,
    maxlength: [1000, 'Summary cannot exceed 1000 characters'],
    trim: true
  },
  
  // Professional Experience
  experience: [{
    jobTitle: {
      type: String,
      required: true,
      trim: true,
      maxlength: [150, 'Job title cannot exceed 150 characters']
    },
    company: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters']
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, 'Location cannot exceed 100 characters']
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      validate: {
        validator: function(endDate) {
          return !endDate || endDate >= this.startDate;
        },
        message: 'End date must be after start date'
      }
    },
    isCurrent: {
      type: Boolean,
      default: false
    },
    description: {
      type: String,
      maxlength: [2000, 'Job description cannot exceed 2000 characters']
    },
    achievements: [{
      type: String,
      maxlength: [500, 'Achievement cannot exceed 500 characters']
    }],
    keyResponsibilities: [{
      type: String,
      maxlength: [300, 'Key responsibility cannot exceed 300 characters']
    }],
    technologies: [{
      type: String,
      trim: true
    }],
    displayOrder: {
      type: Number,
      default: 0
    }
  }],
  
  // Education Section
  education: [{
    degree: {
      type: String,
      required: true,
      trim: true,
      maxlength: [150, 'Degree cannot exceed 150 characters']
    },
    institution: {
      type: String,
      required: true,
      trim: true,
      maxlength: [150, 'Institution name cannot exceed 150 characters']
    },
    fieldOfStudy: {
      type: String,
      trim: true,
      maxlength: [100, 'Field of study cannot exceed 100 characters']
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, 'Location cannot exceed 100 characters']
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      validate: {
        validator: function(endDate) {
          return !endDate || endDate >= this.startDate;
        },
        message: 'End date must be after start date'
      }
    },
    isCompleted: {
      type: Boolean,
      default: true
    },
    grade: {
      type: String,
      trim: true,
      maxlength: [50, 'Grade cannot exceed 50 characters']
    },
    gpa: {
      type: Number,
      min: [0, 'GPA cannot be negative'],
      max: [10, 'GPA cannot exceed 10']
    },
    relevantCourses: [{
      type: String,
      trim: true,
      maxlength: [100, 'Course name cannot exceed 100 characters']
    }],
    achievements: [{
      type: String,
      maxlength: [300, 'Achievement cannot exceed 300 characters']
    }],
    displayOrder: {
      type: Number,
      default: 0
    }
  }],
  
  // Skills Section
  skills: {
    technical: [{
      category: {
        type: String,
        trim: true,
        maxlength: [50, 'Category cannot exceed 50 characters']
      },
      items: [{
        name: {
          type: String,
          required: true,
          trim: true,
          maxlength: [50, 'Skill name cannot exceed 50 characters']
        },
        level: {
          type: String,
          enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
          default: 'Intermediate'
        },
        yearsOfExperience: {
          type: Number,
          min: [0, 'Years of experience cannot be negative']
        }
      }]
    }],
    soft: [{
      name: {
        type: String,
        required: true,
        trim: true,
        maxlength: [50, 'Soft skill cannot exceed 50 characters']
      },
      level: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
        default: 'Intermediate'
      }
    }],
    languages: [{
      name: {
        type: String,
        required: true,
        trim: true,
        maxlength: [30, 'Language name cannot exceed 30 characters']
      },
      proficiency: {
        type: String,
        enum: ['Basic', 'Conversational', 'Fluent', 'Native'],
        default: 'Conversational'
      }
    }]
  },
  
  // Projects Section
  projects: [{
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [150, 'Project title cannot exceed 150 characters']
    },
    description: {
      type: String,
      required: true,
      maxlength: [1000, 'Project description cannot exceed 1000 characters']
    },
    technologies: [{
      type: String,
      trim: true,
      maxlength: [50, 'Technology cannot exceed 50 characters']
    }],
    startDate: Date,
    endDate: Date,
    isOngoing: {
      type: Boolean,
      default: false
    },
    projectUrl: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.*/, 'Please enter a valid URL']
    },
    githubUrl: {
      type: String,
      trim: true,
      match: [/^https?:\/\/(www\.)?github\.com\/.*/, 'Please enter a valid GitHub URL']
    },
    demoUrl: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.*/, 'Please enter a valid URL']
    },
    keyFeatures: [{
      type: String,
      maxlength: [200, 'Key feature cannot exceed 200 characters']
    }],
    role: {
      type: String,
      trim: true,
      maxlength: [100, 'Role cannot exceed 100 characters']
    },
    teamSize: {
      type: Number,
      min: [1, 'Team size must be at least 1']
    },
    displayOrder: {
      type: Number,
      default: 0
    }
  }],
  
  // Certifications Section
  certifications: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [150, 'Certification name cannot exceed 150 characters']
    },
    issuer: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Issuer name cannot exceed 100 characters']
    },
    issueDate: {
      type: Date,
      required: true
    },
    expiryDate: {
      type: Date,
      validate: {
        validator: function(expiryDate) {
          return !expiryDate || expiryDate >= this.issueDate;
        },
        message: 'Expiry date must be after issue date'
      }
    },
    credentialId: {
      type: String,
      trim: true,
      maxlength: [100, 'Credential ID cannot exceed 100 characters']
    },
    credentialUrl: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.*/, 'Please enter a valid URL']
    },
    isActive: {
      type: Boolean,
      default: true
    },
    displayOrder: {
      type: Number,
      default: 0
    }
  }],
  
  // Awards & Honors
  awards: [{
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [150, 'Award title cannot exceed 150 characters']
    },
    issuer: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Issuer cannot exceed 100 characters']
    },
    date: {
      type: Date,
      required: true
    },
    description: {
      type: String,
      maxlength: [500, 'Award description cannot exceed 500 characters']
    },
    displayOrder: {
      type: Number,
      default: 0
    }
  }],
  
  // Publications
  publications: [{
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Publication title cannot exceed 200 characters']
    },
    publisher: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Publisher cannot exceed 100 characters']
    },
    publishDate: {
      type: Date,
      required: true
    },
    url: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.*/, 'Please enter a valid URL']
    },
    doi: {
      type: String,
      trim: true
    },
    coAuthors: [{
      type: String,
      trim: true
    }],
    description: {
      type: String,
      maxlength: [500, 'Publication description cannot exceed 500 characters']
    },
    displayOrder: {
      type: Number,
      default: 0
    }
  }],
  
  // Volunteer Experience
  volunteerExperience: [{
    organization: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Organization name cannot exceed 100 characters']
    },
    role: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Role cannot exceed 100 characters']
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      validate: {
        validator: function(endDate) {
          return !endDate || endDate >= this.startDate;
        },
        message: 'End date must be after start date'
      }
    },
    isCurrent: {
      type: Boolean,
      default: false
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    location: {
      type: String,
      trim: true
    },
    hoursPerWeek: {
      type: Number,
      min: [0, 'Hours per week cannot be negative']
    },
    displayOrder: {
      type: Number,
      default: 0
    }
  }],
  
  // Additional Sections
  additionalSections: [{
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, 'Section title cannot exceed 50 characters']
    },
    content: {
      type: String,
      required: true,
      maxlength: [2000, 'Section content cannot exceed 2000 characters']
    },
    displayOrder: {
      type: Number,
      default: 0
    }
  }],
  
  // Resume Configuration
  settings: {
    theme: {
      type: String,
      default: 'modern',
      enum: ['classic', 'modern', 'creative', 'minimal', 'professional']
    },
    colorScheme: {
      primary: {
        type: String,
        default: '#2563eb',
        match: [/^#[0-9A-F]{6}$/i, 'Please enter a valid hex color']
      },
      secondary: {
        type: String,
        default: '#64748b',
        match: [/^#[0-9A-F]{6}$/i, 'Please enter a valid hex color']
      },
      accent: {
        type: String,
        default: '#f97316',
        match: [/^#[0-9A-F]{6}$/i, 'Please enter a valid hex color']
      }
    },
    layout: {
      type: String,
      default: 'single-column',
      enum: ['single-column', 'two-column', 'three-section']
    },
    fontSize: {
      type: String,
      default: 'medium',
      enum: ['small', 'medium', 'large']
    },
    margins: {
      type: String,
      default: 'normal',
      enum: ['narrow', 'normal', 'wide']
    },
    showProfilePicture: {
      type: Boolean,
      default: false
    },
    sectionOrder: [{
      section: {
        type: String,
        enum: [
          'personalInfo', 'summary', 'experience', 'education', 
          'skills', 'projects', 'certifications', 'awards', 
          'publications', 'volunteerExperience', 'additionalSections'
        ]
      },
      isVisible: {
        type: Boolean,
        default: true
      },
      displayOrder: {
        type: Number,
        default: 0
      }
    }]
  },
  
  // AI & Analytics
  aiGeneration: {
    isAiGenerated: {
      type: Boolean,
      default: false
    },
    baseJobDescription: {
      type: String,
      maxlength: [5000, 'Job description cannot exceed 5000 characters']
    },
    aiPrompt: {
      type: String,
      maxlength: [1000, 'AI prompt cannot exceed 1000 characters']
    },
    generatedAt: Date,
    aiVersion: {
      type: String,
      default: 'gpt-3.5-turbo'
    },
    optimizationSuggestions: [{
      section: String,
      suggestion: String,
      priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
      },
      appliedAt: Date
    }]
  },
  
  // File Information
  files: {
    pdf: {
      filename: String,
      originalName: String,
      path: String,
      size: Number,
      generatedAt: Date
    },
    docx: {
      filename: String,
      originalName: String,
      path: String,
      size: Number,
      generatedAt: Date
    },
    html: {
      filename: String,
      originalName: String,
      path: String,
      size: Number,
      generatedAt: Date
    }
  },
  
  // Usage & Analytics
  analytics: {
    viewCount: {
      type: Number,
      default: 0
    },
    downloadCount: {
      type: Number,
      default: 0
    },
    shareCount: {
      type: Number,
      default: 0
    },
    lastViewedAt: Date,
    lastDownloadedAt: Date,
    applicationsUsed: {
      type: Number,
      default: 0
    },
    jobApplications: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobApplication'
    }]
  },
  
  // Status & Visibility
  status: {
    type: String,
    enum: ['Draft', 'Active', 'Archived', 'Template'],
    default: 'Draft'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  shareToken: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // Metadata
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  category: {
    type: String,
    enum: [
      'Software Development', 'Data Science', 'Marketing', 'Sales',
      'Design', 'Finance', 'HR', 'Operations', 'Consulting', 'Other'
    ],
    default: 'Other'
  },
  
  // Version Control
  parentResumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume'
  },
  childVersions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume'
  }],
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
resumeSchema.virtual('fullName').get(function() {
  return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
});

// Virtual for total experience
resumeSchema.virtual('totalExperience').get(function() {
  if (!this.experience || this.experience.length === 0) return 0;
  
  let totalMonths = 0;
  this.experience.forEach(exp => {
    const startDate = new Date(exp.startDate);
    const endDate = exp.endDate ? new Date(exp.endDate) : new Date();
    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                   (endDate.getMonth() - startDate.getMonth());
    totalMonths += months;
  });
  
  return Math.round(totalMonths / 12 * 10) / 10;
});

// Virtual for active certifications
resumeSchema.virtual('activeCertifications').get(function() {
  if (!this.certifications) return [];
  
  const now = new Date();
  return this.certifications.filter(cert => 
    cert.isActive && (!cert.expiryDate || cert.expiryDate > now)
  );
});

// Virtual for resume completeness score
resumeSchema.virtual('completenessScore').get(function() {
  let score = 0;
  let maxScore = 100;
  
  // Personal info (20 points)
  if (this.personalInfo.firstName && this.personalInfo.lastName && this.personalInfo.email) score += 10;
  if (this.personalInfo.phone) score += 5;
  if (this.personalInfo.address && this.personalInfo.address.city) score += 5;
  
  // Summary (10 points)
  if (this.summary && this.summary.length > 50) score += 10;
  
  // Experience (30 points)
  if (this.experience && this.experience.length > 0) {
    score += 15;
    if (this.experience.some(exp => exp.achievements && exp.achievements.length > 0)) score += 15;
  }
  
  // Education (15 points)
  if (this.education && this.education.length > 0) score += 15;
  
  // Skills (15 points)
  let skillCount = 0;
  if (this.skills.technical) skillCount += this.skills.technical.reduce((acc, cat) => acc + cat.items.length, 0);
  if (this.skills.soft) skillCount += this.skills.soft.length;
  if (skillCount >= 5) score += 15;
  
  // Additional sections (10 points)
  let additionalCount = 0;
  if (this.projects && this.projects.length > 0) additionalCount++;
  if (this.certifications && this.certifications.length > 0) additionalCount++;
  if (this.awards && this.awards.length > 0) additionalCount++;
  if (additionalCount >= 2) score += 10;
  
  return Math.min(score, maxScore);
});

// Indexes for better performance
resumeSchema.index({ userId: 1, createdAt: -1 });
resumeSchema.index({ userId: 1, status: 1 });
resumeSchema.index({ userId: 1, type: 1 });
resumeSchema.index({ shareToken: 1 });
resumeSchema.index({ tags: 1 });
resumeSchema.index({ category: 1 });

// Text search index
resumeSchema.index({
  title: 'text',
  'personalInfo.firstName': 'text',
  'personalInfo.lastName': 'text',
  summary: 'text'
});

// Pre-save middleware
resumeSchema.pre('save', function(next) {
  // Generate share token if resume is made public
  if (this.isModified('isPublic') && this.isPublic && !this.shareToken) {
    this.shareToken = require('crypto').randomBytes(32).toString('hex');
  }
  
  // Update analytics
  if (this.isModified('analytics.viewCount')) {
    this.analytics.lastViewedAt = new Date();
  }
  
  if (this.isModified('analytics.downloadCount')) {
    this.analytics.lastDownloadedAt = new Date();
  }
  
  // Sort sections by display order
  ['experience', 'education', 'projects', 'certifications', 'awards', 'publications', 'volunteerExperience']
    .forEach(section => {
      if (this[section] && Array.isArray(this[section])) {
        this[section].sort((a, b) => (b.displayOrder || 0) - (a.displayOrder || 0));
      }
    });
  
  next();
});

// Method to generate PDF
resumeSchema.methods.generatePDF = async function(options = {}) {
  const pdfService = require('../services/pdfService');
  
  try {
    const pdfBuffer = await pdfService.generateResumePDF(this, options);
    const filename = `resume_${this._id}_${Date.now()}.pdf`;
    const path = `uploads/resumes/pdf/${filename}`;
    
    // Save PDF info
    this.files.pdf = {
      filename: filename,
      originalName: `${this.title.replace(/\s+/g, '_')}.pdf`,
      path: path,
      size: pdfBuffer.length,
      generatedAt: new Date()
    };
    
    await this.save();
    return { buffer: pdfBuffer, filename, path };
  } catch (error) {
    throw new Error(`PDF generation failed: ${error.message}`);
  }
};

// Method to increment view count
resumeSchema.methods.incrementViewCount = function() {
  this.analytics.viewCount += 1;
  this.analytics.lastViewedAt = new Date();
  return this.save({ validateBeforeSave: false });
};

// Method to increment download count
resumeSchema.methods.incrementDownloadCount = function() {
  this.analytics.downloadCount += 1;
  this.analytics.lastDownloadedAt = new Date();
  return this.save({ validateBeforeSave: false });
};

// Method to create a new version
resumeSchema.methods.createVersion = function(newTitle, changes = {}) {
  const Resume = this.constructor;
  
  const newResumeData = {
    ...this.toObject(),
    _id: undefined,
    __v: undefined,
    title: newTitle,
    version: this.generateNextVersion(),
    parentResumeId: this._id,
    createdAt: undefined,
    updatedAt: undefined,
    analytics: {
      viewCount: 0,
      downloadCount: 0,
      shareCount: 0,
      applicationsUsed: 0,
      jobApplications: []
    },
    files: {},
    shareToken: undefined,
    ...changes
  };
  
  return new Resume(newResumeData);
};

// Method to generate next version number
resumeSchema.methods.generateNextVersion = function() {
  const currentVersion = this.version || '1.0';
  const parts = currentVersion.split('.');
  const major = parseInt(parts[0] || '1');
  const minor = parseInt(parts[1] || '0');
  
  return `${major}.${minor + 1}`;
};

// Method to apply AI suggestions
resumeSchema.methods.applyAISuggestion = function(suggestionIndex) {
  if (!this.aiGeneration.optimizationSuggestions[suggestionIndex]) {
    throw new Error('Invalid suggestion index');
  }
  
  this.aiGeneration.optimizationSuggestions[suggestionIndex].appliedAt = new Date();
  return this.save();
};

// Method to check if resume needs update
resumeSchema.methods.needsUpdate = function() {
  const lastUpdate = new Date(this.updatedAt);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return lastUpdate < thirtyDaysAgo && this.status === 'Active';
};

// Static method to get user's resumes with stats
resumeSchema.statics.getUserResumesWithStats = function(userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId), isArchived: false } },
    {
      $lookup: {
        from: 'jobapplications',
        localField: '_id',
        foreignField: 'documents.resume.resumeId',
        as: 'applications'
      }
    },
    {
      $addFields: {
        applicationsCount: { $size: '$applications' },
        completenessScore: '$completenessScore'
      }
    },
    { $sort: { updatedAt: -1 } }
  ]);
};

// Static method to find resumes by skills
resumeSchema.statics.findBySkills = function(skills) {
  return this.find({
    $or: [
      { 'skills.technical.items.name': { $in: skills } },
      { 'skills.soft.name': { $in: skills } }
    ],
    isPublic: true,
    status: 'Active'
  });
};

// Static method to get template resumes
resumeSchema.statics.getTemplates = function(category = null) {
  const query = { type: 'Template', status: 'Active' };
  if (category) query.category = category;
  
  return this.find(query).select('title description templateName category settings');
};

module.exports = mongoose.model('Resume', resumeSchema);

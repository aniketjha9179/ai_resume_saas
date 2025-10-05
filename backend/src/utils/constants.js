// src/utils/constants.js

// Application Status Constants
const JOB_STATUS = {
  SAVED: 'Saved',
  APPLIED: 'Applied',
  INTERVIEWING: 'Interview Scheduled',
  OFFER: 'Offer Received',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn'
};

const JOB_STATUS_ARRAY = Object.values(JOB_STATUS);

// Resume Status Constants
const RESUME_STATUS = {
  DRAFT: 'Draft',
  ACTIVE: 'Active',
  ARCHIVED: 'Archived'
};

// Job Types
const JOB_TYPES = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  FREELANCE: 'Freelance',
  INTERNSHIP: 'Internship',
  TEMPORARY: 'Temporary'
};

const JOB_TYPES_ARRAY = Object.values(JOB_TYPES);

// Work Modes
const WORK_MODES = {
  REMOTE: 'Remote',
  ONSITE: 'On-site',
  HYBRID: 'Hybrid'
};

const WORK_MODES_ARRAY = Object.values(WORK_MODES);

// Experience Levels
const EXPERIENCE_LEVELS = {
  ENTRY: 'Entry Level',
  JUNIOR: 'Junior',
  MID: 'Mid Level',
  SENIOR: 'Senior',
  LEAD: 'Lead',
  MANAGER: 'Manager',
  DIRECTOR: 'Director',
  EXECUTIVE: 'Executive'
};

const EXPERIENCE_LEVELS_ARRAY = Object.values(EXPERIENCE_LEVELS);

// Reminder Types
const REMINDER_TYPES = {
  FOLLOW_UP: 'Follow-up',
  INTERVIEW: 'Interview',
  DEADLINE: 'Application Deadline',
  CUSTOM: 'Custom'
};

// Reminder Status
const REMINDER_STATUS = {
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled'
};

// Priority Levels
const PRIORITY_LEVELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent'
};

// File Upload Constants
const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ALLOWED_EXTENSIONS: ['.pdf', '.doc', '.docx'],
  RESUME_PATH: 'uploads/resumes/',
  PROFILE_PHOTO_PATH: 'uploads/profiles/',
  PROFILE_PHOTO_MAX_SIZE: 2 * 1024 * 1024 // 2MB
};

// Pagination Constants
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

// JWT Constants
const JWT = {
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
  RESET_TOKEN_EXPIRY: '1h',
  VERIFICATION_TOKEN_EXPIRY: '24h'
};

// Rate Limiting
const RATE_LIMITS = {
  AUTH: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 5
  },
  API: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100
  },
  AI: {
    WINDOW_MS: 60 * 60 * 1000, // 1 hour
    MAX_REQUESTS: 20
  }
};

// Email Templates
const EMAIL_TYPES = {
  WELCOME: 'welcome',
  VERIFICATION: 'verification',
  PASSWORD_RESET: 'password_reset',
  REMINDER: 'reminder',
  APPLICATION_UPDATE: 'application_update'
};

// Analytics Time Periods
const TIME_PERIODS = {
  WEEK: 'week',
  MONTH: 'month',
  QUARTER: 'quarter',
  YEAR: 'year',
  ALL_TIME: 'all_time'
};

// Dashboard Chart Colors
const CHART_COLORS = {
  PRIMARY: '#3B82F6',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  DANGER: '#EF4444',
  INFO: '#06B6D4',
  SECONDARY: '#6B7280'
};

// Status Color Mapping
const STATUS_COLORS = {
  [JOB_STATUS.SAVED]: '#6B7280',
  [JOB_STATUS.APPLIED]: '#3B82F6',
  [JOB_STATUS.INTERVIEWING]: '#F59E0B',
  [JOB_STATUS.OFFER]: '#8B5CF6',
  [JOB_STATUS.ACCEPTED]: '#10B981',
  [JOB_STATUS.REJECTED]: '#EF4444',
  [JOB_STATUS.WITHDRAWN]: '#6B7280'
};

// Validation Constants
const VALIDATION = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  EMAIL_MAX_LENGTH: 100,
  PHONE_LENGTH: 10,
  COMPANY_MAX_LENGTH: 100,
  JOB_TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 5000,
  NOTES_MAX_LENGTH: 2000,
  URL_MAX_LENGTH: 500,
  SALARY_MIN: 0,
  SALARY_MAX: 10000000
};

// Regex Patterns
const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[6-9]\d{9}$/,
  URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  ALPHA_NUMERIC: /^[a-zA-Z0-9]+$/,
  ALPHA_SPACE: /^[a-zA-Z\s]+$/
};

// Error Messages
const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  NOT_FOUND: 'Resource not found',
  BAD_REQUEST: 'Invalid request',
  VALIDATION_ERROR: 'Validation failed',
  SERVER_ERROR: 'Internal server error',
  DUPLICATE_ENTRY: 'Resource already exists',
  INVALID_CREDENTIALS: 'Invalid email or password',
  TOKEN_EXPIRED: 'Token has expired',
  TOKEN_INVALID: 'Invalid token',
  FILE_TOO_LARGE: 'File size exceeds limit',
  INVALID_FILE_TYPE: 'Invalid file type',
  RATE_LIMIT_EXCEEDED: 'Too many requests, please try again later'
};

// Success Messages
const SUCCESS_MESSAGES = {
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  REGISTRATION_SUCCESS: 'Registration successful',
  PASSWORD_RESET: 'Password reset successfully',
  EMAIL_SENT: 'Email sent successfully',
  VERIFICATION_SUCCESS: 'Verification successful'
};

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

// Default User Settings
const DEFAULT_SETTINGS = {
  notifications: {
    email: true,
    reminders: true,
    applicationUpdates: true
  },
  theme: 'light',
  language: 'en',
  timezone: 'UTC'
};

// AI Prompt Templates
const AI_PROMPTS = {
  RESUME_ANALYSIS: 'Analyze this resume and provide insights on strengths, weaknesses, and suggestions for improvement.',
  JOB_MATCH: 'Compare this resume with the job description and provide a match score with detailed analysis.',
  COVER_LETTER: 'Generate a professional cover letter based on the resume and job description.',
  SKILLS_EXTRACTION: 'Extract and categorize all skills mentioned in this resume.',
  INTERVIEW_PREP: 'Generate potential interview questions based on this job description and resume.'
};

// LinkedIn Job Status Mapping
const LINKEDIN_STATUS_MAPPING = {
  'submitted': JOB_STATUS.APPLIED,
  'in_progress': JOB_STATUS.INTERVIEWING,
  'hired': JOB_STATUS.ACCEPTED,
  'not_selected': JOB_STATUS.REJECTED
};

// Application Source
const APPLICATION_SOURCES = {
  MANUAL: 'Manual',
  LINKEDIN: 'LinkedIn',
  GMAIL: 'Gmail',
  INDEED: 'Indeed',
  NAUKRI: 'Naukri',
  OTHER: 'Other'
};

module.exports = {
  JOB_STATUS,
  JOB_STATUS_ARRAY,
  RESUME_STATUS,
  JOB_TYPES,
  JOB_TYPES_ARRAY,
  WORK_MODES,
  WORK_MODES_ARRAY,
  EXPERIENCE_LEVELS,
  EXPERIENCE_LEVELS_ARRAY,
  REMINDER_TYPES,
  REMINDER_STATUS,
  PRIORITY_LEVELS,
  FILE_UPLOAD,
  PAGINATION,
  JWT,
  RATE_LIMITS,
  EMAIL_TYPES,
  TIME_PERIODS,
  CHART_COLORS,
  STATUS_COLORS,
  VALIDATION,
  REGEX,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  HTTP_STATUS,
  DEFAULT_SETTINGS,
  AI_PROMPTS,
  LINKEDIN_STATUS_MAPPING,
  APPLICATION_SOURCES
};
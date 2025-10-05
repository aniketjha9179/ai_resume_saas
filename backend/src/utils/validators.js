// src/utils/validators.js

const { REGEX, VALIDATION, JOB_STATUS_ARRAY, JOB_TYPES_ARRAY, WORK_MODES_ARRAY } = require('./constants');

/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {Object} Validation result
 */
const validateEmail = (email) => {
  if (!email) {
    return { isValid: false, message: 'Email is required' };
  }
  if (email.length > VALIDATION.EMAIL_MAX_LENGTH) {
    return { isValid: false, message: `Email must not exceed ${VALIDATION.EMAIL_MAX_LENGTH} characters` };
  }
  if (!REGEX.EMAIL.test(email)) {
    return { isValid: false, message: 'Invalid email format' };
  }
  return { isValid: true, message: 'Valid email' };
};

/**
 * Validate password strength
 * @param {string} password - Password string
 * @returns {Object} Validation result with strength
 */
const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: 'Password is required', strength: 'none' };
  }
  
  if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
    return { 
      isValid: false, 
      message: `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`,
      strength: 'weak'
    };
  }
  
  if (password.length > VALIDATION.PASSWORD_MAX_LENGTH) {
    return { 
      isValid: false, 
      message: `Password must not exceed ${VALIDATION.PASSWORD_MAX_LENGTH} characters`,
      strength: 'weak'
    };
  }

  // Check password strength
  let strength = 0;
  const checks = {
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&]/.test(password),
    length: password.length >= 12
  };

  strength += checks.lowercase ? 1 : 0;
  strength += checks.uppercase ? 1 : 0;
  strength += checks.number ? 1 : 0;
  strength += checks.special ? 1 : 0;
  strength += checks.length ? 1 : 0;

  const strengthMap = {
    0: 'very weak',
    1: 'weak',
    2: 'fair',
    3: 'good',
    4: 'strong',
    5: 'very strong'
  };

  const isValid = strength >= 3;
  const message = isValid 
    ? `Password strength: ${strengthMap[strength]}` 
    : 'Password must contain uppercase, lowercase, number, and special character';

  return { 
    isValid, 
    message, 
    strength: strengthMap[strength],
    checks 
  };
};

/**
 * Validate phone number (Indian format)
 * @param {string} phone - Phone number
 * @returns {Object} Validation result
 */
const validatePhone = (phone) => {
  if (!phone) {
    return { isValid: false, message: 'Phone number is required' };
  }
  
  // Remove spaces and hyphens
  const cleanPhone = phone.replace(/[\s-]/g, '');
  
  if (cleanPhone.length !== VALIDATION.PHONE_LENGTH) {
    return { isValid: false, message: `Phone number must be ${VALIDATION.PHONE_LENGTH} digits` };
  }
  
  if (!REGEX.PHONE.test(cleanPhone)) {
    return { isValid: false, message: 'Invalid phone number format' };
  }
  
  return { isValid: true, message: 'Valid phone number' };
};

/**
 * Validate URL format
 * @param {string} url - URL string
 * @returns {Object} Validation result
 */
const validateURL = (url) => {
  if (!url) {
    return { isValid: true, message: 'URL is optional' };
  }
  
  if (url.length > VALIDATION.URL_MAX_LENGTH) {
    return { isValid: false, message: `URL must not exceed ${VALIDATION.URL_MAX_LENGTH} characters` };
  }
  
  if (!REGEX.URL.test(url)) {
    return { isValid: false, message: 'Invalid URL format' };
  }
  
  return { isValid: true, message: 'Valid URL' };
};

/**
 * Validate name
 * @param {string} name - Name string
 * @returns {Object} Validation result
 */
const validateName = (name) => {
  if (!name) {
    return { isValid: false, message: 'Name is required' };
  }
  
  const trimmedName = name.trim();
  
  if (trimmedName.length < VALIDATION.NAME_MIN_LENGTH) {
    return { isValid: false, message: `Name must be at least ${VALIDATION.NAME_MIN_LENGTH} characters` };
  }
  
  if (trimmedName.length > VALIDATION.NAME_MAX_LENGTH) {
    return { isValid: false, message: `Name must not exceed ${VALIDATION.NAME_MAX_LENGTH} characters` };
  }
  
  if (!REGEX.ALPHA_SPACE.test(trimmedName)) {
    return { isValid: false, message: 'Name can only contain letters and spaces' };
  }
  
  return { isValid: true, message: 'Valid name' };
};

/**
 * Validate job application data
 * @param {Object} jobData - Job application data
 * @returns {Object} Validation result
 */
const validateJobApplication = (jobData) => {
  const errors = [];
  
  // Required fields
  if (!jobData.company || jobData.company.trim().length === 0) {
    errors.push('Company name is required');
  }
  
  if (!jobData.position || jobData.position.trim().length === 0) {
    errors.push('Job position is required');
  }
  
  // Validate status
  if (jobData.status && !JOB_STATUS_ARRAY.includes(jobData.status)) {
    errors.push('Invalid job status');
  }
  
  // Validate job type
  if (jobData.jobType && !JOB_TYPES_ARRAY.includes(jobData.jobType)) {
    errors.push('Invalid job type');
  }
  
  // Validate work mode
  if (jobData.workMode && !WORK_MODES_ARRAY.includes(jobData.workMode)) {
    errors.push('Invalid work mode');
  }
  
  // Validate URL
  if (jobData.jobUrl) {
    const urlValidation = validateURL(jobData.jobUrl);
    if (!urlValidation.isValid) {
      errors.push(urlValidation.message);
    }
  }
  
  // Validate salary
  if (jobData.salary) {
    const salary = parseInt(jobData.salary);
    if (isNaN(salary) || salary < VALIDATION.SALARY_MIN || salary > VALIDATION.SALARY_MAX) {
      errors.push(`Salary must be between ${VALIDATION.SALARY_MIN} and ${VALIDATION.SALARY_MAX}`);
    }
  }
  
  // Validate dates
  if (jobData.appliedDate && isNaN(new Date(jobData.appliedDate).getTime())) {
    errors.push('Invalid application date');
  }
  
  if (jobData.deadline && isNaN(new Date(jobData.deadline).getTime())) {
    errors.push('Invalid deadline date');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    message: errors.length === 0 ? 'Valid job application data' : 'Validation failed'
  };
};

/**
 * Validate reminder data
 * @param {Object} reminderData - Reminder data
 * @returns {Object} Validation result
 */
const validateReminder = (reminderData) => {
  const errors = [];
  
  if (!reminderData.title || reminderData.title.trim().length === 0) {
    errors.push('Reminder title is required');
  }
  
  if (!reminderData.reminderDate) {
    errors.push('Reminder date is required');
  } else {
    const reminderDate = new Date(reminderData.reminderDate);
    if (isNaN(reminderDate.getTime())) {
      errors.push('Invalid reminder date');
    } else if (reminderDate < new Date()) {
      errors.push('Reminder date cannot be in the past');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    message: errors.length === 0 ? 'Valid reminder data' : 'Validation failed'
  };
};

/**
 * Validate file upload
 * @param {Object} file - File object
 * @param {number} maxSize - Maximum file size in bytes
 * @param {Array} allowedTypes - Allowed MIME types
 * @returns {Object} Validation result
 */
const validateFileUpload = (file, maxSize, allowedTypes) => {
  if (!file) {
    return { isValid: false, message: 'No file provided' };
  }
  
  if (file.size > maxSize) {
    return { 
      isValid: false, 
      message: `File size exceeds maximum limit of ${maxSize / (1024 * 1024)}MB` 
    };
  }
  
  if (!allowedTypes.includes(file.mimetype)) {
    return { 
      isValid: false, 
      message: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}` 
    };
  }
  
  return { isValid: true, message: 'Valid file' };
};

/**
 * Validate date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Object} Validation result
 */
const validateDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return { isValid: false, message: 'Both start and end dates are required' };
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { isValid: false, message: 'Invalid date format' };
  }
  
  if (start > end) {
    return { isValid: false, message: 'Start date must be before end date' };
  }
  
  return { isValid: true, message: 'Valid date range' };
};

/**
 * Validate MongoDB ObjectId
 * @param {string} id - Object ID
 * @returns {Object} Validation result
 */
const validateObjectId = (id) => {
  if (!id) {
    return { isValid: false, message: 'ID is required' };
  }
  
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  
  if (!objectIdRegex.test(id)) {
    return { isValid: false, message: 'Invalid ID format' };
  }
  
  return { isValid: true, message: 'Valid ID' };
};

/**
 * Validate pagination parameters
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Object} Validation result with sanitized values
 */
const validatePagination = (page, limit) => {
  const sanitizedPage = parseInt(page) || 1;
  const sanitizedLimit = parseInt(limit) || 10;
  
  const errors = [];
  
  if (sanitizedPage < 1) {
    errors.push('Page number must be greater than 0');
  }
  
  if (sanitizedLimit < 1) {
    errors.push('Limit must be greater than 0');
  }
  
  if (sanitizedLimit > 100) {
    errors.push('Limit cannot exceed 100 items per page');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    page: Math.max(1, sanitizedPage),
    limit: Math.min(100, Math.max(1, sanitizedLimit)),
    message: errors.length === 0 ? 'Valid pagination' : 'Invalid pagination parameters'
  };
};

/**
 * Sanitize user input to prevent XSS
 * @param {string} input - User input
 * @returns {string} Sanitized input
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
};

/**
 * Validate and sanitize search query
 * @param {string} query - Search query
 * @returns {Object} Validation result with sanitized query
 */
const validateSearchQuery = (query) => {
  if (!query) {
    return { isValid: false, message: 'Search query is required', sanitizedQuery: '' };
  }
  
  const sanitizedQuery = sanitizeInput(query.trim());
  
  if (sanitizedQuery.length < 2) {
    return { 
      isValid: false, 
      message: 'Search query must be at least 2 characters',
      sanitizedQuery: ''
    };
  }
  
  if (sanitizedQuery.length > 100) {
    return { 
      isValid: false, 
      message: 'Search query cannot exceed 100 characters',
      sanitizedQuery: sanitizedQuery.substring(0, 100)
    };
  }
  
  return { 
    isValid: true, 
    message: 'Valid search query',
    sanitizedQuery
  };
};

/**
 * Validate array of IDs
 * @param {Array} ids - Array of IDs
 * @returns {Object} Validation result
 */
const validateIdArray = (ids) => {
  if (!Array.isArray(ids)) {
    return { isValid: false, message: 'IDs must be an array' };
  }
  
  if (ids.length === 0) {
    return { isValid: false, message: 'At least one ID is required' };
  }
  
  const invalidIds = ids.filter(id => !validateObjectId(id).isValid);
  
  if (invalidIds.length > 0) {
    return { 
      isValid: false, 
      message: `Invalid IDs found: ${invalidIds.join(', ')}` 
    };
  }
  
  return { isValid: true, message: 'Valid ID array' };
};

/**
 * Validate skills array
 * @param {Array} skills - Array of skills
 * @returns {Object} Validation result
 */
const validateSkills = (skills) => {
  if (!Array.isArray(skills)) {
    return { isValid: false, message: 'Skills must be an array' };
  }
  
  if (skills.length === 0) {
    return { isValid: true, message: 'Skills array can be empty' };
  }
  
  if (skills.length > 50) {
    return { isValid: false, message: 'Cannot add more than 50 skills' };
  }
  
  const invalidSkills = skills.filter(skill => 
    typeof skill !== 'string' || skill.trim().length === 0 || skill.length > 50
  );
  
  if (invalidSkills.length > 0) {
    return { 
      isValid: false, 
      message: 'Each skill must be a non-empty string with max 50 characters' 
    };
  }
  
  return { isValid: true, message: 'Valid skills array' };
};

/**
 * Validate salary range
 * @param {number} minSalary - Minimum salary
 * @param {number} maxSalary - Maximum salary
 * @returns {Object} Validation result
 */
const validateSalaryRange = (minSalary, maxSalary) => {
  const errors = [];
  
  if (minSalary !== undefined && minSalary !== null) {
    const min = parseInt(minSalary);
    if (isNaN(min) || min < VALIDATION.SALARY_MIN) {
      errors.push(`Minimum salary must be at least ${VALIDATION.SALARY_MIN}`);
    }
  }
  
  if (maxSalary !== undefined && maxSalary !== null) {
    const max = parseInt(maxSalary);
    if (isNaN(max) || max > VALIDATION.SALARY_MAX) {
      errors.push(`Maximum salary cannot exceed ${VALIDATION.SALARY_MAX}`);
    }
  }
  
  if (minSalary && maxSalary && parseInt(minSalary) > parseInt(maxSalary)) {
    errors.push('Minimum salary cannot be greater than maximum salary');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    message: errors.length === 0 ? 'Valid salary range' : 'Invalid salary range'
  };
};

/**
 * Validate user profile update data
 * @param {Object} profileData - Profile data
 * @returns {Object} Validation result
 */
const validateProfileUpdate = (profileData) => {
  const errors = [];
  
  if (profileData.name) {
    const nameValidation = validateName(profileData.name);
    if (!nameValidation.isValid) {
      errors.push(nameValidation.message);
    }
  }
  
  if (profileData.email) {
    const emailValidation = validateEmail(profileData.email);
    if (!emailValidation.isValid) {
      errors.push(emailValidation.message);
    }
  }
  
  if (profileData.phone) {
    const phoneValidation = validatePhone(profileData.phone);
    if (!phoneValidation.isValid) {
      errors.push(phoneValidation.message);
    }
  }
  
  if (profileData.linkedin) {
    const urlValidation = validateURL(profileData.linkedin);
    if (!urlValidation.isValid) {
      errors.push('Invalid LinkedIn URL');
    }
  }
  
  if (profileData.github) {
    const urlValidation = validateURL(profileData.github);
    if (!urlValidation.isValid) {
      errors.push('Invalid GitHub URL');
    }
  }
  
  if (profileData.portfolio) {
    const urlValidation = validateURL(profileData.portfolio);
    if (!urlValidation.isValid) {
      errors.push('Invalid portfolio URL');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    message: errors.length === 0 ? 'Valid profile data' : 'Validation failed'
  };
};

/**
 * Batch validate multiple fields
 * @param {Object} data - Data object with fields to validate
 * @param {Object} rules - Validation rules
 * @returns {Object} Validation result
 */
const batchValidate = (data, rules) => {
  const errors = {};
  let isValid = true;
  
  for (const [field, validators] of Object.entries(rules)) {
    const value = data[field];
    
    for (const validator of validators) {
      const result = validator(value);
      
      if (!result.isValid) {
        errors[field] = result.message;
        isValid = false;
        break;
      }
    }
  }
  
  return {
    isValid,
    errors,
    message: isValid ? 'All validations passed' : 'Some validations failed'
  };
};

module.exports = {
  validateEmail,
  validatePassword,
  validatePhone,
  validateURL,
  validateName,
  validateJobApplication,
  validateReminder,
  validateFileUpload,
  validateDateRange,
  validateObjectId,
  validatePagination,
  sanitizeInput,
  validateSearchQuery,
  validateIdArray,
  validateSkills,
  validateSalaryRange,
  validateProfileUpdate,
  batchValidate
};
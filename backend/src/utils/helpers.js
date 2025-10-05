// src/utils/helpers.js

/**
 * Format date to readable string
 * @param {Date} date - Date object
 * @returns {string} Formatted date string
 */
const formatDate = (date) => {
  if (!date) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(date).toLocaleDateString('en-US', options);
};

/**
 * Calculate days between two dates
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {number} Number of days
 */
const daysBetween = (startDate, endDate = new Date()) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Generate random string for tokens
 * @param {number} length - Length of string
 * @returns {string} Random string
 */
const generateRandomString = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Sanitize filename for safe storage
 * @param {string} filename - Original filename
 * @returns {string} Sanitized filename
 */
const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
};

/**
 * Parse resume filename to extract metadata
 * @param {string} filename - Resume filename
 * @returns {Object} Metadata object
 */
const parseResumeFilename = (filename) => {
  const parts = filename.split('_');
  return {
    userId: parts[0] || null,
    timestamp: parts[1] || null,
    version: parts[2] || null,
    originalName: parts.slice(3).join('_') || filename
  };
};

/**
 * Format file size to human readable
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Calculate application success rate
 * @param {Array} applications - Job applications array
 * @returns {number} Success rate percentage
 */
const calculateSuccessRate = (applications) => {
  if (!applications || applications.length === 0) return 0;
  const successful = applications.filter(
    app => ['Interview Scheduled', 'Offer Received', 'Accepted'].includes(app.status)
  ).length;
  return ((successful / applications.length) * 100).toFixed(2);
};

/**
 * Group applications by status
 * @param {Array} applications - Job applications array
 * @returns {Object} Grouped applications
 */
const groupByStatus = (applications) => {
  return applications.reduce((acc, app) => {
    const status = app.status || 'Unknown';
    if (!acc[status]) acc[status] = [];
    acc[status].push(app);
    return acc;
  }, {});
};

/**
 * Generate slug from string
 * @param {string} str - Input string
 * @returns {string} Slug
 */
const slugify = (str) => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Capitalize first letter of each word
 * @param {string} str - Input string
 * @returns {string} Capitalized string
 */
const capitalize = (str) => {
  return str.replace(/\b\w/g, char => char.toUpperCase());
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Input text
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
const truncate = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Remove duplicates from array
 * @param {Array} arr - Input array
 * @param {string} key - Key to check for duplicates
 * @returns {Array} Array without duplicates
 */
const removeDuplicates = (arr, key = null) => {
  if (!key) return [...new Set(arr)];
  return arr.filter((item, index, self) => 
    index === self.findIndex(t => t[key] === item[key])
  );
};

/**
 * Sort array of objects by key
 * @param {Array} arr - Array to sort
 * @param {string} key - Key to sort by
 * @param {string} order - 'asc' or 'desc'
 * @returns {Array} Sorted array
 */
const sortBy = (arr, key, order = 'asc') => {
  return arr.sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (order === 'asc') {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    }
    return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
  });
};

/**
 * Check if object is empty
 * @param {Object} obj - Object to check
 * @returns {boolean} True if empty
 */
const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};

/**
 * Deep clone object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Generate pagination metadata
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 * @returns {Object} Pagination metadata
 */
const getPaginationMeta = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  return {
    currentPage: parseInt(page),
    itemsPerPage: parseInt(limit),
    totalItems: total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
};

/**
 * Extract domain from email
 * @param {string} email - Email address
 * @returns {string} Domain
 */
const extractDomain = (email) => {
  return email.split('@')[1] || '';
};

/**
 * Mask sensitive data
 * @param {string} str - String to mask
 * @param {number} visible - Number of visible characters
 * @returns {string} Masked string
 */
const maskData = (str, visible = 4) => {
  if (!str || str.length <= visible) return str;
  return str.slice(0, visible) + '*'.repeat(str.length - visible);
};

/**
 * Generate initials from name
 * @param {string} name - Full name
 * @returns {string} Initials
 */
const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Check if date is past
 * @param {Date} date - Date to check
 * @returns {boolean} True if past
 */
const isPastDate = (date) => {
  return new Date(date) < new Date();
};

/**
 * Get time ago string
 * @param {Date} date - Date to compare
 * @returns {string} Time ago string
 */
const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
    }
  }
  
  return 'just now';
};

module.exports = {
  formatDate,
  daysBetween,
  generateRandomString,
  sanitizeFilename,
  parseResumeFilename,
  formatFileSize,
  calculateSuccessRate,
  groupByStatus,
  slugify,
  capitalize,
  truncate,
  removeDuplicates,
  sortBy,
  isEmpty,
  deepClone,
  getPaginationMeta,
  extractDomain,
  maskData,
  getInitials,
  isPastDate,
  timeAgo
};
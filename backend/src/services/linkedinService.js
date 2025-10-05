// src/services/linkedinService.js
const axios = require('axios');
const cheerio = require('cheerio');

class LinkedInService {
  constructor() {
    this.baseUrl = 'https://www.linkedin.com';
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Connection': 'keep-alive'
    };
  }

  // Search jobs on LinkedIn
  async searchJobs(keywords, location = '', filters = {}) {
    try {
      const params = new URLSearchParams({
        keywords: keywords,
        location: location,
        f_TPR: filters.timePosted || '', // r86400 (24h), r604800 (week)
        f_E: filters.experienceLevel || '', // 2 (entry), 3 (associate), 4 (mid), 5 (director)
        f_JT: filters.jobType || '', // F (full-time), P (part-time), C (contract)
        f_WT: filters.workType || '', // 1 (onsite), 2 (remote), 3 (hybrid)
        start: filters.start || 0
      });

      const url = `${this.baseUrl}/jobs/search?${params.toString()}`;

      const response = await axios.get(url, { 
        headers: this.headers,
        timeout: 10000 
      });

      const $ = cheerio.load(response.data);
      const jobs = [];

      $('.job-search-card').each((i, element) => {
        const job = this.parseJobCard($, element);
        if (job) jobs.push(job);
      });

      return jobs;
    } catch (error) {
      console.error('LinkedIn job search error:', error.message);
      throw new Error('Failed to search LinkedIn jobs');
    }
  }

  // Parse job card
  parseJobCard($, element) {
    try {
      const $el = $(element);
      
      const title = $el.find('.base-search-card__title').text().trim();
      const company = $el.find('.base-search-card__subtitle').text().trim();
      const location = $el.find('.job-search-card__location').text().trim();
      const jobUrl = $el.find('.base-card__full-link').attr('href');
      const jobId = jobUrl ? this.extractJobId(jobUrl) : null;
      const postedDate = $el.find('time').attr('datetime');
      const description = $el.find('.base-search-card__snippet').text().trim();

      return {
        title,
        company,
        location,
        url: jobUrl,
        jobId,
        postedDate: postedDate ? new Date(postedDate) : null,
        description,
        source: 'LinkedIn'
      };
    } catch (error) {
      console.error('Job card parsing error:', error);
      return null;
    }
  }

  // Extract job ID from URL
  extractJobId(url) {
    const match = url.match(/jobs\/view\/(\d+)/);
    return match ? match[1] : null;
  }

  // Get job details
  async getJobDetails(jobId) {
    try {
      const url = `${this.baseUrl}/jobs/view/${jobId}`;
      
      const response = await axios.get(url, { 
        headers: this.headers,
        timeout: 10000 
      });

      const $ = cheerio.load(response.data);

      const jobDetails = {
        title: $('.top-card-layout__title').text().trim(),
        company: $('.topcard__org-name-link').text().trim(),
        location: $('.topcard__flavor--bullet').first().text().trim(),
        employmentType: this.extractEmploymentType($),
        seniorityLevel: this.extractSeniorityLevel($),
        description: $('.show-more-less-html__markup').text().trim(),
        skills: this.extractSkills($),
        applicants: this.extractApplicants($),
        postedDate: this.extractPostedDate($)
      };

      return jobDetails;
    } catch (error) {
      console.error('Job details error:', error.message);
      throw new Error('Failed to get job details');
    }
  }

  // Extract employment type
  extractEmploymentType($) {
    const text = $('.description__job-criteria-text').text();
    if (text.includes('Full-time')) return 'Full-time';
    if (text.includes('Part-time')) return 'Part-time';
    if (text.includes('Contract')) return 'Contract';
    if (text.includes('Internship')) return 'Internship';
    return null;
  }

  // Extract seniority level
  extractSeniorityLevel($) {
    const text = $('.description__job-criteria-text').text();
    if (text.includes('Entry level')) return 'Entry level';
    if (text.includes('Associate')) return 'Associate';
    if (text.includes('Mid-Senior')) return 'Mid-Senior';
    if (text.includes('Director')) return 'Director';
    if (text.includes('Executive')) return 'Executive';
    return null;
  }

  // Extract skills from job description
  extractSkills($) {
    const description = $('.show-more-less-html__markup').text().toLowerCase();
    const commonSkills = [
      'javascript', 'python', 'java', 'react', 'node.js', 'aws',
      'sql', 'mongodb', 'docker', 'kubernetes', 'git', 'agile',
      'typescript', 'vue', 'angular', 'express', 'postgresql'
    ];

    return commonSkills.filter(skill => description.includes(skill.toLowerCase()));
  }

  // Extract number of applicants
  extractApplicants($) {
    const text = $('.num-applicants__caption').text();
    const match = text.match(/(\d+)/);
    return match ? parseInt(match[1]) : null;
  }

  // Extract posted date
  extractPostedDate($) {
    const text = $('.posted-time-ago__text').text();
    // Parse relative time like "2 days ago", "1 week ago"
    if (text.includes('hour')) {
      return new Date(Date.now() - 3600000);
    } else if (text.includes('day')) {
      const days = parseInt(text.match(/(\d+)/)?.[1] || 1);
      return new Date(Date.now() - days * 86400000);
    } else if (text.includes('week')) {
      const weeks = parseInt(text.match(/(\d+)/)?.[1] || 1);
      return new Date(Date.now() - weeks * 7 * 86400000);
    }
    return null;
  }

  // Scrape company info
  async getCompanyInfo(companyName) {
    try {
      const searchUrl = `${this.baseUrl}/search/results/companies/?keywords=${encodeURIComponent(companyName)}`;
      
      const response = await axios.get(searchUrl, { 
        headers: this.headers,
        timeout: 10000 
      });

      const $ = cheerio.load(response.data);
      
      const companyCard = $('.entity-result').first();
      
      const companyInfo = {
        name: companyCard.find('.entity-result__title-text').text().trim(),
        industry: companyCard.find('.entity-result__primary-subtitle').text().trim(),
        size: companyCard.find('.entity-result__secondary-subtitle').text().trim(),
        url: companyCard.find('.app-aware-link').attr('href'),
        description: companyCard.find('.entity-result__summary').text().trim()
      };

      return companyInfo;
    } catch (error) {
      console.error('Company info error:', error.message);
      throw new Error('Failed to get company info');
    }
  }

  // Parse LinkedIn profile URL to extract data
  parseProfileUrl(profileUrl) {
    try {
      const match = profileUrl.match(/linkedin\.com\/in\/([^\/\?]+)/);
      return match ? match[1] : null;
    } catch (error) {
      return null;
    }
  }

  // Generate job search URL
  generateSearchUrl(keywords, location, filters = {}) {
    const params = new URLSearchParams({
      keywords: keywords,
      location: location,
      ...filters
    });

    return `${this.baseUrl}/jobs/search?${params.toString()}`;
  }

  // Extract salary information if available
  extractSalary($) {
    const salaryText = $('.salary').text().trim();
    if (!salaryText) return null;

    const match = salaryText.match(/\$?([\d,]+)\s*-?\s*\$?([\d,]+)?/);
    if (match) {
      return {
        min: parseInt(match[1].replace(/,/g, '')),
        max: match[2] ? parseInt(match[2].replace(/,/g, '')) : null,
        currency: 'USD'
      };
    }
    return null;
  }

  // Check if Easy Apply is available
  isEasyApply($, element) {
    const $el = $(element);
    return $el.find('.job-search-card__easy-apply-label').length > 0;
  }

  // Rate limiting helper
  async rateLimitDelay(ms = 2000) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Batch job search with rate limiting
  async batchSearchJobs(searchQueries) {
    const results = [];
    
    for (const query of searchQueries) {
      try {
        const jobs = await this.searchJobs(
          query.keywords, 
          query.location, 
          query.filters
        );
        results.push({
          query,
          jobs,
          success: true
        });
        
        // Rate limiting
        await this.rateLimitDelay(3000);
      } catch (error) {
        results.push({
          query,
          jobs: [],
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }

  // Extract company logo URL
  extractCompanyLogo($, element) {
    const $el = $(element);
    const imgSrc = $el.find('.artdeco-entity-image').attr('src');
    return imgSrc || null;
  }

  // Validate LinkedIn URL
  isValidLinkedInUrl(url) {
    const linkedInRegex = /^https?:\/\/(www\.)?linkedin\.com\/(in|company|jobs)\/[a-zA-Z0-9-]+\/?$/;
    return linkedInRegex.test(url);
  }
}

module.exports = new LinkedInService();
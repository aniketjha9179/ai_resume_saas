// src/services/gmailService.js
const { google } = require('googleapis');
const { OAuth2 } = google.auth;

class GmailService {
  constructor() {
    this.oauth2Client = new OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      process.env.GMAIL_REDIRECT_URI
    );
  }

  // Get authorization URL
  getAuthUrl() {
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.modify'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  // Exchange authorization code for tokens
  async getTokens(code) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      return tokens;
    } catch (error) {
      console.error('Token exchange error:', error);
      throw new Error('Failed to get Gmail tokens');
    }
  }

  // Set user credentials
  setCredentials(tokens) {
    this.oauth2Client.setCredentials(tokens);
  }

  // Search for job-related emails
  async searchJobEmails(tokens, query = 'job application OR interview OR offer') {
    try {
      this.setCredentials(tokens);
      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

      const response = await gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: 50
      });

      if (!response.data.messages) {
        return [];
      }

      const messages = await Promise.all(
        response.data.messages.map(async (message) => {
          const details = await gmail.users.messages.get({
            userId: 'me',
            id: message.id,
            format: 'full'
          });
          return this.parseEmailData(details.data);
        })
      );

      return messages;
    } catch (error) {
      console.error('Gmail search error:', error);
      throw new Error('Failed to search Gmail');
    }
  }

  // Parse email data
  parseEmailData(message) {
    const headers = message.payload.headers;
    const subject = headers.find(h => h.name === 'Subject')?.value || '';
    const from = headers.find(h => h.name === 'From')?.value || '';
    const date = headers.find(h => h.name === 'Date')?.value || '';
    const to = headers.find(h => h.name === 'To')?.value || '';

    let body = '';
    if (message.payload.body.data) {
      body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
    } else if (message.payload.parts) {
      const textPart = message.payload.parts.find(part => 
        part.mimeType === 'text/plain' || part.mimeType === 'text/html'
      );
      if (textPart && textPart.body.data) {
        body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
      }
    }

    return {
      id: message.id,
      threadId: message.threadId,
      subject,
      from,
      to,
      date: new Date(date),
      body: this.cleanEmailBody(body),
      snippet: message.snippet,
      labelIds: message.labelIds || []
    };
  }

  // Clean email body from HTML and extra whitespace
  cleanEmailBody(body) {
    return body
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 500); // Limit to 500 chars
  }

  // Send email via Gmail
  async sendEmail(tokens, emailData) {
    try {
      this.setCredentials(tokens);
      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

      const { to, subject, body, attachments = [] } = emailData;

      // Create email message
      const messageParts = [
        `To: ${to}`,
        `Subject: ${subject}`,
        'Content-Type: text/html; charset=utf-8',
        '',
        body
      ];

      const message = messageParts.join('\n');
      const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const response = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage
        }
      });

      return response.data;
    } catch (error) {
      console.error('Gmail send error:', error);
      throw new Error('Failed to send email');
    }
  }

  // Create draft email
  async createDraft(tokens, emailData) {
    try {
      this.setCredentials(tokens);
      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

      const { to, subject, body } = emailData;

      const messageParts = [
        `To: ${to}`,
        `Subject: ${subject}`,
        'Content-Type: text/html; charset=utf-8',
        '',
        body
      ];

      const message = messageParts.join('\n');
      const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const response = await gmail.users.drafts.create({
        userId: 'me',
        requestBody: {
          message: {
            raw: encodedMessage
          }
        }
      });

      return response.data;
    } catch (error) {
      console.error('Gmail draft error:', error);
      throw new Error('Failed to create draft');
    }
  }

  // Get user profile
  async getUserProfile(tokens) {
    try {
      this.setCredentials(tokens);
      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

      const response = await gmail.users.getProfile({
        userId: 'me'
      });

      return {
        emailAddress: response.data.emailAddress,
        messagesTotal: response.data.messagesTotal,
        threadsTotal: response.data.threadsTotal
      };
    } catch (error) {
      console.error('Gmail profile error:', error);
      throw new Error('Failed to get Gmail profile');
    }
  }

  // Add label to message
  async addLabel(tokens, messageId, labelId) {
    try {
      this.setCredentials(tokens);
      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

      await gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          addLabelIds: [labelId]
        }
      });

      return true;
    } catch (error) {
      console.error('Gmail label error:', error);
      throw new Error('Failed to add label');
    }
  }

  // Mark message as read
  async markAsRead(tokens, messageId) {
    try {
      this.setCredentials(tokens);
      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

      await gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          removeLabelIds: ['UNREAD']
        }
      });

      return true;
    } catch (error) {
      console.error('Gmail mark read error:', error);
      throw new Error('Failed to mark as read');
    }
  }

  // Extract job details from email
  extractJobDetailsFromEmail(email) {
    const { subject, body, from } = email;
    
    // Simple extraction logic (can be enhanced with AI)
    const jobDetails = {
      company: this.extractCompany(from, body),
      position: this.extractPosition(subject, body),
      status: this.detectStatus(subject, body),
      interviewDate: this.extractDate(body)
    };

    return jobDetails;
  }

  // Extract company name
  extractCompany(from, body) {
    // Extract from email domain
    const domainMatch = from.match(/@([^.]+)\./);
    if (domainMatch) {
      return domainMatch[1].charAt(0).toUpperCase() + domainMatch[1].slice(1);
    }
    return null;
  }

  // Extract position from text
  extractPosition(subject, body) {
    const positionKeywords = ['position', 'role', 'job', 'opening'];
    const text = `${subject} ${body}`.toLowerCase();
    
    for (const keyword of positionKeywords) {
      const index = text.indexOf(keyword);
      if (index !== -1) {
        const words = text.substring(index, index + 100).split(' ');
        return words.slice(0, 5).join(' ');
      }
    }
    return null;
  }

  // Detect application status
  detectStatus(subject, body) {
    const text = `${subject} ${body}`.toLowerCase();
    
    if (text.includes('offer') || text.includes('congratulations')) {
      return 'offer';
    } else if (text.includes('interview') || text.includes('schedule')) {
      return 'interview';
    } else if (text.includes('reject') || text.includes('unfortunately')) {
      return 'rejected';
    } else if (text.includes('received') || text.includes('application')) {
      return 'applied';
    }
    return 'unknown';
  }

  // Extract date from text
  extractDate(body) {
    const dateRegex = /\b\d{1,2}\/\d{1,2}\/\d{4}\b/;
    const match = body.match(dateRegex);
    return match ? new Date(match[0]) : null;
  }

  // Refresh access token
  async refreshAccessToken(refreshToken) {
    try {
      this.oauth2Client.setCredentials({
        refresh_token: refreshToken
      });

      const { credentials } = await this.oauth2Client.refreshAccessToken();
      return credentials;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw new Error('Failed to refresh Gmail token');
    }
  }
}

module.exports = new GmailService();
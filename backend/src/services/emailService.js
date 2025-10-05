// src/services/emailService.js
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Send welcome email
  async sendWelcomeEmail(userEmail, userName) {
    try {
      const mailOptions = {
        from: `"Resume Job Tracker" <${process.env.SMTP_USER}>`,
        to: userEmail,
        subject: 'Welcome to Resume Job Tracker! 🎉',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">Welcome ${userName}!</h2>
            <p>Thank you for joining Resume Job Tracker. We're excited to help you manage your job search journey.</p>
            <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1F2937; margin-top: 0;">Get Started:</h3>
              <ul style="color: #4B5563;">
                <li>Complete your profile</li>
                <li>Add your first job application</li>
                <li>Generate AI-optimized resumes</li>
                <li>Track your progress</li>
              </ul>
            </div>
            <p style="color: #6B7280;">Best of luck with your job search!</p>
            <p style="color: #6B7280; font-size: 12px;">The Resume Job Tracker Team</p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Welcome email sent to ${userEmail}`);
    } catch (error) {
      console.error('Welcome email error:', error);
      throw new Error('Failed to send welcome email');
    }
  }

  // Send reminder email
  async sendReminderEmail(userEmail, reminderDetails) {
    try {
      const { jobTitle, company, action, dueDate } = reminderDetails;
      
      const mailOptions = {
        from: `"Resume Job Tracker" <${process.env.SMTP_USER}>`,
        to: userEmail,
        subject: `Reminder: ${action} for ${jobTitle} at ${company}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #DC2626;">⏰ Follow-up Reminder</h2>
            <div style="background: #FEF2F2; padding: 20px; border-left: 4px solid #DC2626; margin: 20px 0;">
              <p style="margin: 0; color: #991B1B;"><strong>Action:</strong> ${action}</p>
              <p style="margin: 10px 0 0 0; color: #991B1B;"><strong>Position:</strong> ${jobTitle}</p>
              <p style="margin: 10px 0 0 0; color: #991B1B;"><strong>Company:</strong> ${company}</p>
              <p style="margin: 10px 0 0 0; color: #991B1B;"><strong>Due:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
            </div>
            <p style="color: #4B5563;">Don't forget to follow up on this application!</p>
            <a href="${process.env.FRONTEND_URL}/dashboard" 
               style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; margin-top: 10px;">
              View Dashboard
            </a>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Reminder email sent to ${userEmail}`);
    } catch (error) {
      console.error('Reminder email error:', error);
      throw new Error('Failed to send reminder email');
    }
  }

  // Send application status update
  async sendStatusUpdateEmail(userEmail, applicationDetails) {
    try {
      const { jobTitle, company, oldStatus, newStatus } = applicationDetails;
      
      const statusColors = {
        applied: '#3B82F6',
        screening: '#F59E0B',
        interview: '#8B5CF6',
        offer: '#10B981',
        rejected: '#EF4444',
        accepted: '#059669'
      };

      const color = statusColors[newStatus.toLowerCase()] || '#6B7280';

      const mailOptions = {
        from: `"Resume Job Tracker" <${process.env.SMTP_USER}>`,
        to: userEmail,
        subject: `Application Update: ${jobTitle} at ${company}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: ${color};">Application Status Updated</h2>
            <div style="background: #F9FAFB; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #1F2937; margin: 0;"><strong>${jobTitle}</strong></p>
              <p style="color: #6B7280; margin: 5px 0;">${company}</p>
              <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 15px 0;">
              <p style="color: #6B7280; margin: 0;">
                Status changed from <strong>${oldStatus}</strong> to 
                <strong style="color: ${color};">${newStatus}</strong>
              </p>
            </div>
            <a href="${process.env.FRONTEND_URL}/applications" 
               style="display: inline-block; background: ${color}; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; margin-top: 10px;">
              View Application
            </a>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Status update email sent to ${userEmail}`);
    } catch (error) {
      console.error('Status update email error:', error);
      throw new Error('Failed to send status update email');
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(userEmail, resetToken) {
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

      const mailOptions = {
        from: `"Resume Job Tracker" <${process.env.SMTP_USER}>`,
        to: userEmail,
        subject: 'Password Reset Request',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1F2937;">Password Reset Request</h2>
            <p style="color: #4B5563;">You requested to reset your password. Click the button below to proceed:</p>
            <a href="${resetUrl}" 
               style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; margin: 20px 0;">
              Reset Password
            </a>
            <p style="color: #6B7280; font-size: 14px;">This link will expire in 1 hour.</p>
            <p style="color: #6B7280; font-size: 14px;">If you didn't request this, please ignore this email.</p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Password reset email sent to ${userEmail}`);
    } catch (error) {
      console.error('Password reset email error:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  // Send weekly digest
  async sendWeeklyDigest(userEmail, stats) {
    try {
      const { totalApplications, interviews, offers, recentActivity } = stats;

      const mailOptions = {
        from: `"Resume Job Tracker" <${process.env.SMTP_USER}>`,
        to: userEmail,
        subject: 'Your Weekly Job Search Summary 📊',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">Your Week in Review</h2>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0;">
              <div style="background: #EEF2FF; padding: 15px; border-radius: 8px; text-align: center;">
                <h3 style="color: #4F46E5; margin: 0; font-size: 24px;">${totalApplications}</h3>
                <p style="color: #6B7280; margin: 5px 0 0 0; font-size: 14px;">Applications</p>
              </div>
              <div style="background: #F3E8FF; padding: 15px; border-radius: 8px; text-align: center;">
                <h3 style="color: #8B5CF6; margin: 0; font-size: 24px;">${interviews}</h3>
                <p style="color: #6B7280; margin: 5px 0 0 0; font-size: 14px;">Interviews</p>
              </div>
              <div style="background: #D1FAE5; padding: 15px; border-radius: 8px; text-align: center;">
                <h3 style="color: #10B981; margin: 0; font-size: 24px;">${offers}</h3>
                <p style="color: #6B7280; margin: 5px 0 0 0; font-size: 14px;">Offers</p>
              </div>
            </div>
            <h3 style="color: #1F2937;">Recent Activity</h3>
            <ul style="color: #4B5563; line-height: 1.8;">
              ${recentActivity.map(activity => `<li>${activity}</li>`).join('')}
            </ul>
            <p style="color: #6B7280;">Keep up the great work! 💪</p>
            <a href="${process.env.FRONTEND_URL}/dashboard" 
               style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; margin-top: 10px;">
              View Full Dashboard
            </a>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Weekly digest sent to ${userEmail}`);
    } catch (error) {
      console.error('Weekly digest email error:', error);
      throw new Error('Failed to send weekly digest');
    }
  }
}

module.exports = new EmailService();
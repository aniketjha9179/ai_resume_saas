// src/services/pdfService.js
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFService {
  // Generate resume PDF
  async generateResumePDF(resumeData, outputPath) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ 
          size: 'A4', 
          margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });

        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        // Header - Name and Contact
        doc.fontSize(24)
           .font('Helvetica-Bold')
           .text(resumeData.personalInfo.name, { align: 'center' });

        doc.fontSize(10)
           .font('Helvetica')
           .moveDown(0.3)
           .text(resumeData.personalInfo.email, { align: 'center' });

        if (resumeData.personalInfo.phone) {
          doc.text(` | ${resumeData.personalInfo.phone}`, { 
            align: 'center', 
            continued: false 
          });
        }

        if (resumeData.personalInfo.location) {
          doc.text(` | ${resumeData.personalInfo.location}`, { align: 'center' });
        }

        if (resumeData.personalInfo.linkedin) {
          doc.fillColor('blue')
             .text(resumeData.personalInfo.linkedin, { 
               align: 'center', 
               link: resumeData.personalInfo.linkedin 
             })
             .fillColor('black');
        }

        doc.moveDown(1.5);

        // Professional Summary
        if (resumeData.summary) {
          this.addSection(doc, 'PROFESSIONAL SUMMARY');
          doc.fontSize(10)
             .font('Helvetica')
             .text(resumeData.summary, { align: 'justify' });
          doc.moveDown(1);
        }

        // Skills
        if (resumeData.skills && resumeData.skills.length > 0) {
          this.addSection(doc, 'SKILLS');
          doc.fontSize(10)
             .font('Helvetica')
             .text(resumeData.skills.join(' • '), { align: 'left' });
          doc.moveDown(1);
        }

        // Experience
        if (resumeData.experience && resumeData.experience.length > 0) {
          this.addSection(doc, 'PROFESSIONAL EXPERIENCE');
          
          resumeData.experience.forEach((exp, index) => {
            doc.fontSize(12)
               .font('Helvetica-Bold')
               .text(exp.title, { continued: true })
               .fontSize(10)
               .font('Helvetica')
               .text(` | ${exp.company}`, { continued: false });

            doc.fontSize(9)
               .fillColor('gray')
               .text(`${exp.location} | ${exp.startDate} - ${exp.endDate || 'Present'}`)
               .fillColor('black');

            doc.moveDown(0.5);

            if (exp.description) {
              doc.fontSize(10)
                 .font('Helvetica')
                 .text(exp.description, { align: 'justify' });
            }

            if (exp.achievements && exp.achievements.length > 0) {
              exp.achievements.forEach(achievement => {
                doc.fontSize(10)
                   .text(`• ${achievement}`, { 
                     indent: 10, 
                     align: 'left' 
                   });
              });
            }

            if (index < resumeData.experience.length - 1) {
              doc.moveDown(1);
            }
          });

          doc.moveDown(1);
        }

        // Education
        if (resumeData.education && resumeData.education.length > 0) {
          this.addSection(doc, 'EDUCATION');
          
          resumeData.education.forEach((edu, index) => {
            doc.fontSize(12)
               .font('Helvetica-Bold')
               .text(edu.degree, { continued: true })
               .fontSize(10)
               .font('Helvetica')
               .text(` | ${edu.institution}`, { continued: false });

            doc.fontSize(9)
               .fillColor('gray')
               .text(`${edu.location} | ${edu.graduationDate}`)
               .fillColor('black');

            if (edu.gpa) {
              doc.text(`GPA: ${edu.gpa}`);
            }

            if (index < resumeData.education.length - 1) {
              doc.moveDown(0.8);
            }
          });

          doc.moveDown(1);
        }

        // Projects
        if (resumeData.projects && resumeData.projects.length > 0) {
          this.addSection(doc, 'PROJECTS');
          
          resumeData.projects.forEach((project, index) => {
            doc.fontSize(11)
               .font('Helvetica-Bold')
               .text(project.name);

            if (project.link) {
              doc.fontSize(9)
                 .fillColor('blue')
                 .text(project.link, { link: project.link })
                 .fillColor('black');
            }

            doc.moveDown(0.3)
               .fontSize(10)
               .font('Helvetica')
               .text(project.description, { align: 'justify' });

            if (project.technologies) {
              doc.fontSize(9)
                 .fillColor('gray')
                 .text(`Technologies: ${project.technologies.join(', ')}`)
                 .fillColor('black');
            }

            if (index < resumeData.projects.length - 1) {
              doc.moveDown(0.8);
            }
          });

          doc.moveDown(1);
        }

        // Certifications
        if (resumeData.certifications && resumeData.certifications.length > 0) {
          this.addSection(doc, 'CERTIFICATIONS');
          
          resumeData.certifications.forEach(cert => {
            doc.fontSize(10)
               .font('Helvetica')
               .text(`• ${cert.name} - ${cert.issuer} (${cert.date})`);
          });
        }

        doc.end();

        stream.on('finish', () => {
          resolve(outputPath);
        });

        stream.on('error', (error) => {
          reject(error);
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  // Helper method to add section headers
  addSection(doc, title) {
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text(title);
    
    doc.moveTo(doc.x, doc.y)
       .lineTo(doc.page.width - 50, doc.y)
       .stroke('#4F46E5');
    
    doc.moveDown(0.5);
  }

  // Generate cover letter PDF
  async generateCoverLetterPDF(coverLetterData, outputPath) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ 
          size: 'A4', 
          margins: { top: 72, bottom: 72, left: 72, right: 72 }
        });

        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        // Sender's info
        doc.fontSize(11)
           .font('Helvetica')
           .text(coverLetterData.senderName)
           .text(coverLetterData.senderEmail)
           .text(coverLetterData.senderPhone);

        doc.moveDown(2);

        // Date
        doc.text(new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }));

        doc.moveDown(2);

        // Recipient info
        if (coverLetterData.recipientName) {
          doc.text(coverLetterData.recipientName);
        }
        doc.text(coverLetterData.companyName);
        if (coverLetterData.companyAddress) {
          doc.text(coverLetterData.companyAddress);
        }

        doc.moveDown(2);

        // Salutation
        const salutation = coverLetterData.recipientName 
          ? `Dear ${coverLetterData.recipientName},` 
          : 'Dear Hiring Manager,';
        doc.text(salutation);

        doc.moveDown(1);

        // Body
        doc.text(coverLetterData.body, { 
          align: 'justify', 
          lineGap: 3 
        });

        doc.moveDown(2);

        // Closing
        doc.text('Sincerely,')
           .moveDown(2)
           .text(coverLetterData.senderName);

        doc.end();

        stream.on('finish', () => {
          resolve(outputPath);
        });

        stream.on('error', (error) => {
          reject(error);
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  // Parse uploaded resume PDF
  async parseResumePDF(pdfPath) {
    // Note: For actual PDF parsing, you'd use pdf-parse library
    // This is a placeholder for the structure
    try {
      const pdfParse = require('pdf-parse');
      const dataBuffer = fs.readFileSync(pdfPath);
      const data = await pdfParse(dataBuffer);
      
      return {
        text: data.text,
        pages: data.numpages,
        info: data.info
      };
    } catch (error) {
      console.error('PDF parsing error:', error);
      throw new Error('Failed to parse PDF');
    }
  }

  // Delete PDF file
  async deletePDF(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('PDF deletion error:', error);
      throw new Error('Failed to delete PDF');
    }
  }
}

module.exports = new PDFService();
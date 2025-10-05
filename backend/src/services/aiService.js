// src/services/aiService.js
const OpenAI = require('openai');
const openaiConfig = require('../config/openai');

const openai = new OpenAI({
  apiKey: openaiConfig.apiKey
});

class AIService {
  // Generate optimized resume content
  async generateResumeContent(userProfile, jobDescription) {
    try {
      const prompt = `
        Generate an ATS-optimized resume content based on:
        
        User Profile:
        - Name: ${userProfile.name}
        - Email: ${userProfile.email}
        - Skills: ${userProfile.skills?.join(', ') || 'N/A'}
        - Experience: ${JSON.stringify(userProfile.experience || [])}
        - Education: ${JSON.stringify(userProfile.education || [])}
        
        Job Description:
        ${jobDescription}
        
        Create a tailored resume that:
        1. Highlights relevant skills matching the job
        2. Optimizes experience descriptions with action verbs
        3. Includes relevant keywords for ATS
        4. Maintains professional formatting
        
        Return JSON with: summary, skills, experience, education
      `;

      const response = await openai.chat.completions.create({
        model: openaiConfig.model,
        messages: [
          { role: 'system', content: 'You are an expert resume writer and career coach.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('AI Resume Generation Error:', error);
      throw new Error('Failed to generate resume content');
    }
  }

  // Generate cover letter
  async generateCoverLetter(userProfile, jobDetails) {
    try {
      const prompt = `
        Write a professional cover letter for:
        
        Candidate: ${userProfile.name}
        Position: ${jobDetails.position}
        Company: ${jobDetails.company}
        
        User Background:
        ${JSON.stringify(userProfile.experience || [])}
        
        Job Description:
        ${jobDetails.description}
        
        Create a compelling cover letter that:
        1. Shows enthusiasm for the role
        2. Highlights relevant achievements
        3. Demonstrates company knowledge
        4. Is concise (300-400 words)
      `;

      const response = await openai.chat.completions.create({
        model: openaiConfig.model,
        messages: [
          { role: 'system', content: 'You are an expert cover letter writer.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 1000
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('AI Cover Letter Error:', error);
      throw new Error('Failed to generate cover letter');
    }
  }

  // Analyze job posting and suggest improvements
  async analyzeJobFit(userProfile, jobDescription) {
    try {
      const prompt = `
        Analyze the fit between candidate and job:
        
        Candidate Skills: ${userProfile.skills?.join(', ')}
        Candidate Experience: ${userProfile.experience?.map(exp => exp.title).join(', ')}
        
        Job Description:
        ${jobDescription}
        
        Provide analysis with:
        1. Match score (0-100)
        2. Matching skills
        3. Missing skills
        4. Suggestions for improvement
        
        Return as JSON.
      `;

      const response = await openai.chat.completions.create({
        model: openaiConfig.model,
        messages: [
          { role: 'system', content: 'You are a career advisor analyzing job fit.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 800
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('AI Job Analysis Error:', error);
      throw new Error('Failed to analyze job fit');
    }
  }

  // Generate interview preparation tips
  async generateInterviewTips(jobDetails) {
    try {
      const prompt = `
        Generate interview preparation tips for:
        
        Position: ${jobDetails.position}
        Company: ${jobDetails.company}
        Job Description: ${jobDetails.description}
        
        Provide:
        1. 5 likely interview questions
        2. Key skills to emphasize
        3. Company research points
        4. STAR method examples
      `;

      const response = await openai.chat.completions.create({
        model: openaiConfig.model,
        messages: [
          { role: 'system', content: 'You are an interview preparation coach.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('AI Interview Tips Error:', error);
      throw new Error('Failed to generate interview tips');
    }
  }

  // Extract keywords from job description
  async extractKeywords(jobDescription) {
    try {
      const response = await openai.chat.completions.create({
        model: openaiConfig.model,
        messages: [
          { role: 'system', content: 'Extract important keywords and skills from job descriptions.' },
          { role: 'user', content: `Extract key skills, technologies, and requirements from: ${jobDescription}. Return as JSON array.` }
        ],
        temperature: 0.3,
        max_tokens: 500
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('AI Keyword Extraction Error:', error);
      throw new Error('Failed to extract keywords');
    }
  }
}

module.exports = new AIService();
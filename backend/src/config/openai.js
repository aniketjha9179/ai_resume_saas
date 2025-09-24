const { Configuration, OpenAIApi } = require('openai');

// OpenAI Configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

// Default settings
const defaultSettings = {
  model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
  temperature: 0.7,
  max_tokens: 2000,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
};

// Helper functions for different AI tasks
const aiHelpers = {
  // Generate resume based on job description
  generateResume: async (userProfile, jobDescription, resumeType = 'professional') => {
    const prompt = `
    Based on the following user profile and job description, generate a tailored resume:
    
    User Profile:
    ${JSON.stringify(userProfile, null, 2)}
    
    Job Description:
    ${jobDescription}
    
    Resume Type: ${resumeType}
    
    Please generate a well-structured resume in the following format:
    - Professional Summary
    - Key Skills
    - Work Experience
    - Education
    - Additional Sections (if relevant)
    
    Make sure to highlight relevant skills and experiences that match the job requirements.
    `;
    
    try {
      const response = await openai.createChatCompletion({
        ...defaultSettings,
        messages: [
          {
            role: 'system',
            content: 'You are a professional resume writer with expertise in crafting tailored resumes that highlight relevant skills and experiences for specific job opportunities.'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      });
      
      return response.data.choices[0].message.content;
    } catch (error) {
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  },

  // Generate cover letter
  generateCoverLetter: async (userProfile, jobDescription, companyName) => {
    const prompt = `
    Generate a professional cover letter based on:
    
    User Profile: ${JSON.stringify(userProfile, null, 2)}
    Job Description: ${jobDescription}
    Company Name: ${companyName}
    
    The cover letter should be engaging, professional, and specifically tailored to this role and company.
    `;
    
    try {
      const response = await openai.createChatCompletion({
        ...defaultSettings,
        messages: [
          {
            role: 'system',
            content: 'You are a professional career counselor specializing in writing compelling cover letters that help candidates stand out.'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      });
      
      return response.data.choices[0].message.content;
    } catch (error) {
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  },

  // Analyze job description and suggest improvements
  analyzeJobMatch: async (resumeContent, jobDescription) => {
    const prompt = `
    Analyze the match between this resume and job description:
    
    Resume: ${resumeContent}
    Job Description: ${jobDescription}
    
    Provide:
    1. Match percentage
    2. Missing keywords/skills
    3. Suggestions for improvement
    4. Strengths that align with the role
    `;
    
    try {
      const response = await openai.createChatCompletion({
        ...defaultSettings,
        messages: [
          {
            role: 'system',
            content: 'You are an expert HR professional and career coach who analyzes job-resume compatibility and provides actionable feedback.'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      });
      
      return response.data.choices[0].message.content;
    } catch (error) {
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  },

  // Generate interview questions
  generateInterviewQuestions: async (jobDescription, difficulty = 'medium') => {
    const prompt = `
    Generate interview questions for this job description:
    ${jobDescription}
    
    Difficulty Level: ${difficulty}
    
    Include:
    - 5 technical questions
    - 3 behavioral questions
    - 2 situational questions
    
    Provide questions with brief answer guidelines.
    `;
    
    try {
      const response = await openai.createChatCompletion({
        ...defaultSettings,
        messages: [
          {
            role: 'system',
            content: 'You are an experienced interviewer who creates relevant and challenging interview questions for various roles.'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      });
      
      return response.data.choices[0].message.content;
    } catch (error) {
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }
};

// Test OpenAI connection
const testConnection = async () => {
  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 5
    });
    console.log('OpenAI connection successful');
    return true;
  } catch (error) {
    console.error('OpenAI connection failed:', error.message);
    return false;
  }
};

module.exports = {
  openai,
  defaultSettings,
  aiHelpers,
  testConnection
};

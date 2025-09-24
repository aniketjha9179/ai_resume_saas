const JobApplication = require('../models/JobApplication');
const Resume = require('../models/Resume');
const Analytics = require('../models/Analytics');

const analyticsController = {
  // Get dashboard analytics
  getDashboard: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { timeframe = '30' } = req.query; // days
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(timeframe));

      // Job application statistics
      const jobStats = await JobApplication.aggregate([
        { $match: { userId, createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      // Total jobs
      const totalJobs = await JobApplication.countDocuments({ userId });
      
      // Recent jobs
      const recentJobs = await JobApplication.find({ userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('jobTitle company status appliedDate');

      // Resume count
      const resumeCount = await Resume.countDocuments({ userId });

      // Application timeline (last 30 days)
      const timeline = await JobApplication.aggregate([
        { $match: { userId, createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // Company statistics
      const companyStats = await JobApplication.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: '$company',
            count: { $sum: 1 },
            statuses: { $push: '$status' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      // Response rate calculation
      const totalApplications = await JobApplication.countDocuments({ userId });
      const responsesReceived = await JobApplication.countDocuments({
        userId,
        status: { $in: ['interview', 'offer', 'rejected'] }
      });
      
      const responseRate = totalApplications > 0 ? 
        ((responsesReceived / totalApplications) * 100).toFixed(1) : 0;

      res.json({
        success: true,
        data: {
          summary: {
            totalJobs,
            resumeCount,
            responseRate: parseFloat(responseRate),
            timeframe: parseInt(timeframe)
          },
          jobStats: jobStats.reduce((acc, stat) => {
            acc[stat._id] = stat.count;
            return acc;
          }, {}),
          timeline,
          recentJobs,
          companyStats,
          generatedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Get dashboard error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get job application trends
  getTrends: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { period = 'month' } = req.query; // week, month, quarter, year

      let groupFormat;
      let startDate = new Date();

      switch (period) {
        case 'week':
          groupFormat = "%Y-%m-%d";
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'quarter':
          groupFormat = "%Y-%m";
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        case 'year':
          groupFormat = "%Y-%m";
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          groupFormat = "%Y-%m-%d";
          startDate.setMonth(startDate.getMonth() - 1);
      }

      const trends = await JobApplication.aggregate([
        { $match: { userId, createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: groupFormat, date: "$createdAt" } },
              status: '$status'
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: '$_id.date',
            statuses: {
              $push: {
                status: '$_id.status',
                count: '$count'
              }
            },
            total: { $sum: '$count' }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      res.json({
        success: true,
        data: {
          trends,
          period,
          startDate,
          endDate: new Date()
        }
      });
    } catch (error) {
      console.error('Get trends error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get success metrics
  getSuccessMetrics: async (req, res) => {
    try {
      const userId = req.user.userId;

      // Interview conversion rate
      const totalApplications = await JobApplication.countDocuments({ userId });
      const interviews = await JobApplication.countDocuments({
        userId,
        status: { $in: ['interview', 'offer'] }
      });
      const offers = await JobApplication.countDocuments({
        userId,
        status: 'offer'
      });

      const interviewRate = totalApplications > 0 ? 
        ((interviews / totalApplications) * 100).toFixed(1) : 0;
      const offerRate = totalApplications > 0 ? 
        ((offers / totalApplications) * 100).toFixed(1) : 0;

      // Average response time
      const responseTimes = await JobApplication.aggregate([
        {
          $match: {
            userId,
            appliedDate: { $exists: true },
            responseDate: { $exists: true }
          }
        },
        {
          $project: {
            responseTime: {
              $divide: [
                { $subtract: ['$responseDate', '$appliedDate'] },
                1000 * 60 * 60 * 24 // Convert to days
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            avgResponseTime: { $avg: '$responseTime' },
            minResponseTime: { $min: '$responseTime' },
            maxResponseTime: { $max: '$responseTime' }
          }
        }
      ]);

      // Most successful resume
      const resumeSuccess = await JobApplication.aggregate([
        {
          $match: {
            userId,
            resumeUsed: { $exists: true },
            status: { $in: ['interview', 'offer'] }
          }
        },
        {
          $group: {
            _id: '$resumeUsed',
            successCount: { $sum: 1 },
            totalUsed: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'resumes',
            localField: '_id',
            foreignField: '_id',
            as: 'resume'
          }
        },
        { $sort: { successCount: -1 } },
        { $limit: 5 }
      ]);

      res.json({
        success: true,
        data: {
          conversionRates: {
            interview: parseFloat(interviewRate),
            offer: parseFloat(offerRate)
          },
          responseTimes: responseTimes[0] || {
            avgResponseTime: 0,
            minResponseTime: 0,
            maxResponseTime: 0
          },
          topResumes: resumeSuccess,
          totalApplications,
          totalInterviews: interviews,
          totalOffers: offers
        }
      });
    } catch (error) {
      console.error('Get success metrics error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Export analytics data
  exportAnalytics: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { format = 'json', startDate, endDate } = req.query;

      const dateFilter = {};
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);

      const query = { userId };
      if (Object.keys(dateFilter).length > 0) {
        query.createdAt = dateFilter;
      }

      const jobs = await JobApplication.find(query)
        .populate('resumeUsed', 'name')
        .sort({ createdAt: -1 });

      if (format === 'csv') {
        // Convert to CSV format
        const csvHeader = 'Job Title,Company,Status,Applied Date,Response Date,Salary,Location,Resume Used\n';
        const csvData = jobs.map(job => 
          `"${job.jobTitle}","${job.company}","${job.status}","${job.appliedDate}","${job.responseDate || ''}","${job.salary || ''}","${job.location || ''}","${job.resumeUsed?.name || ''}"`
        ).join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="job_applications.csv"');
        res.send(csvHeader + csvData);
      } else {
        res.json({
          success: true,
          data: {
            jobs,
            exportedAt: new Date(),
            totalRecords: jobs.length
          }
        });
      }
    } catch (error) {
      console.error('Export analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

module.exports = analyticsController;

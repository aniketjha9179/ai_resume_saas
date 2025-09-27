const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');
const { validateDateRange, validateAnalyticsFilter } = require('../middleware/validation');

// All analytics routes require authentication
router.use(auth);

// GET /api/analytics/dashboard - Get dashboard analytics overview
router.get('/dashboard', analyticsController.getDashboardAnalytics);

// GET /api/analytics/applications-over-time - Get applications trend over time
router.get('/applications-over-time', validateDateRange, analyticsController.getApplicationsOverTime);

// GET /api/analytics/status-distribution - Get job status distribution
router.get('/status-distribution', analyticsController.getStatusDistribution);

// GET /api/analytics/response-rate - Get application response rate
router.get('/response-rate', validateDateRange, analyticsController.getResponseRate);

// GET /api/analytics/interview-success-rate - Get interview success rate
router.get('/interview-success-rate', analyticsController.getInterviewSuccessRate);

// GET /api/analytics/application-sources - Get application sources breakdown
router.get('/application-sources', analyticsController.getApplicationSources);

// GET /api/analytics/company-insights - Get company-wise insights
router.get('/company-insights', analyticsController.getCompanyInsights);

// GET /api/analytics/location-insights - Get location-wise insights
router.get('/location-insights', analyticsController.getLocationInsights);

// GET /api/analytics/salary-insights - Get salary range insights
router.get('/salary-insights', analyticsController.getSalaryInsights);

// GET /api/analytics/industry-insights - Get industry-wise insights
router.get('/industry-insights', analyticsController.getIndustryInsights);

// GET /api/analytics/job-type-insights - Get job type insights (remote, hybrid, onsite)
router.get('/job-type-insights', analyticsController.getJobTypeInsights);

// GET /api/analytics/application-timeline - Get application timeline analysis
router.get('/application-timeline', analyticsController.getApplicationTimeline);

// GET /api/analytics/resume-performance - Get resume performance metrics
router.get('/resume-performance', analyticsController.getResumePerformance);

// GET /api/analytics/skills-demand - Get skills demand analysis
router.get('/skills-demand', analyticsController.getSkillsDemand);

// GET /api/analytics/weekly-summary - Get weekly activity summary
router.get('/weekly-summary', analyticsController.getWeeklySummary);

// GET /api/analytics/monthly-report - Get monthly report
router.get('/monthly-report', analyticsController.getMonthlyReport);

// GET /api/analytics/yearly-overview - Get yearly overview
router.get('/yearly-overview', analyticsController.getYearlyOverview);

// GET /api/analytics/goal-tracking - Get goal tracking metrics
router.get('/goal-tracking', analyticsController.getGoalTracking);

// POST /api/analytics/goals - Set application goals
router.post('/goals', analyticsController.setGoals);

// PUT /api/analytics/goals - Update application goals
router.put('/goals', analyticsController.updateGoals);

// GET /api/analytics/predictions - Get AI-powered predictions
router.get('/predictions', analyticsController.getPredictions);

// GET /api/analytics/recommendations - Get personalized recommendations
router.get('/recommendations', analyticsController.getRecommendations);

// GET /api/analytics/benchmarks - Get industry benchmarks comparison
router.get('/benchmarks', analyticsController.getBenchmarks);

// GET /api/analytics/custom-report - Generate custom analytics report
router.get('/custom-report', validateAnalyticsFilter, analyticsController.getCustomReport);

// POST /api/analytics/export - Export analytics data
router.post('/export', analyticsController.exportAnalytics);

// GET /api/analytics/activity-heatmap - Get activity heatmap data
router.get('/activity-heatmap', analyticsController.getActivityHeatmap);

// GET /api/analytics/conversion-funnel - Get application conversion funnel
router.get('/conversion-funnel', analyticsController.getConversionFunnel);

// GET /api/analytics/time-to-response - Get average time to response analysis
router.get('/time-to-response', analyticsController.getTimeToResponse);

// GET /api/analytics/rejection-reasons - Get rejection reasons analysis
router.get('/rejection-reasons', analyticsController.getRejectionReasons);

// GET /api/analytics/follow-up-effectiveness - Get follow-up effectiveness metrics
router.get('/follow-up-effectiveness', analyticsController.getFollowUpEffectiveness);

// POST /api/analytics/track-event - Track custom analytics event
router.post('/track-event', analyticsController.trackEvent);

module.exports = router;
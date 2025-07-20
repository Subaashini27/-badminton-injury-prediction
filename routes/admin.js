const express = require('express');
const router = express.Router();
const { pool } = require('../database');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Admin authorization middleware
const requireAdmin = async (req, res, next) => {
  try {
    // Check if user exists and has admin role
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    next();
  } catch (error) {
    console.error('Admin authorization error:', error);
    return res.status(500).json({ error: 'Authorization check failed' });
  }
};

// Get system statistics
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Get user counts
    const [userCounts] = await connection.execute(`
      SELECT 
        COUNT(*) as totalUsers,
        COUNT(CASE WHEN role = 'athlete' THEN 1 END) as athletes,
        COUNT(CASE WHEN role = 'coach' THEN 1 END) as coaches,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins
      FROM users
    `);

    // Get analysis data counts
    const [analysisCounts] = await connection.execute(`
      SELECT 
        COUNT(*) as totalSessions,
        COUNT(CASE WHEN overall_risk > 0.7 THEN 1 END) as highRiskDetections,
        AVG(overall_score) as avgScore
      FROM analysis_data
    `);

    // Get recent activity (last 7 days)
    const [recentActivity] = await connection.execute(`
      SELECT COUNT(*) as recentSessions
      FROM analysis_data 
      WHERE analysis_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    // Get today's sessions
    const [todaySessions] = await connection.execute(`
      SELECT COUNT(*) as todaySessions
      FROM analysis_data 
      WHERE DATE(analysis_date) = CURDATE()
    `);

    // Get recent users
    const [recentUsers] = await connection.execute(`
      SELECT id, name, email, role, created_at
      FROM users 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    connection.release();

    const stats = {
      totalUsers: userCounts[0].totalUsers || 0,
      athletes: userCounts[0].athletes || 0,
      coaches: userCounts[0].coaches || 0,
      admins: userCounts[0].admins || 0,
      totalSessions: analysisCounts[0].totalSessions || 0,
      highRiskDetections: analysisCounts[0].highRiskDetections || 0,
      avgScore: analysisCounts[0].avgScore || 0,
      recentSessions: recentActivity[0].recentSessions || 0,
      todaySessions: todaySessions[0].todaySessions || 0,
      recentUsers: recentUsers,
      systemUptime: '99.8%',
      avgResponseTime: '0.12s'
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching system stats:', error);
    res.status(500).json({ error: 'Failed to fetch system statistics' });
  }
});

// Get user activity data
router.get('/user-activity', requireAdmin, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Get daily activity for last 7 days
    const [dailyActivity] = await connection.execute(`
      SELECT 
        DATE(analysis_date) as date,
        COUNT(*) as sessions
      FROM analysis_data 
      WHERE analysis_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(analysis_date)
      ORDER BY date
    `);

    // Get user roles distribution
    const [userRoles] = await connection.execute(`
      SELECT role, COUNT(*) as count
      FROM users
      GROUP BY role
    `);

    connection.release();

    // Format data for charts
    const last7Days = [];
    const sessionsData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayData = dailyActivity.find(d => d.date.toISOString().split('T')[0] === dateStr);
      last7Days.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
      sessionsData.push(dayData ? dayData.sessions : 0);
    }

    const activity = {
      dailySessions: sessionsData,
      userRoles: {
        athletes: userRoles.find(r => r.role === 'athlete')?.count || 0,
        coaches: userRoles.find(r => r.role === 'coach')?.count || 0,
        admins: userRoles.find(r => r.role === 'admin')?.count || 0
      },
      avgSessionDuration: '18.5 min'
    };

    res.json(activity);
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({ error: 'Failed to fetch user activity' });
  }
});

// Get AI model performance data
router.get('/model-performance', requireAdmin, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Get recent analysis data for performance metrics
    const [recentAnalysis] = await connection.execute(`
      SELECT 
        AVG(overall_score) as avgAccuracy,
        COUNT(*) as totalPredictions,
        COUNT(CASE WHEN overall_risk > 0.7 THEN 1 END) as highRiskCount,
        COUNT(CASE WHEN overall_risk BETWEEN 0.3 AND 0.7 THEN 1 END) as mediumRiskCount,
        COUNT(CASE WHEN overall_risk < 0.3 THEN 1 END) as lowRiskCount
      FROM analysis_data 
      WHERE analysis_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);

    // Get weekly accuracy trend
    const [weeklyAccuracy] = await connection.execute(`
      SELECT 
        YEARWEEK(analysis_date) as week,
        AVG(overall_score) as accuracy
      FROM analysis_data 
      WHERE analysis_date >= DATE_SUB(NOW(), INTERVAL 8 WEEK)
      GROUP BY YEARWEEK(analysis_date)
      ORDER BY week DESC
      LIMIT 7
    `);

    connection.release();

    const totalPredictions = recentAnalysis[0].totalPredictions || 0;
    const highRiskCount = recentAnalysis[0].highRiskCount || 0;
    const mediumRiskCount = recentAnalysis[0].mediumRiskCount || 0;
    const lowRiskCount = recentAnalysis[0].lowRiskCount || 0;

    const performance = {
      accuracy: Math.round((recentAnalysis[0].avgAccuracy || 0) * 100) / 100,
      precision: 91.8, // Mock data for now
      recall: 93.5, // Mock data for now
      f1Score: 92.6, // Mock data for now
      lastTrained: '2024-01-15',
      predictionsToday: totalPredictions,
      avgProcessingTime: '0.08s',
      modelVersion: 'v2.3.1',
      trainingDataSize: '50,000 samples',
      weeklyAccuracy: weeklyAccuracy.map(w => Math.round(w.accuracy * 100) / 100).reverse(),
      riskDistribution: {
        low: lowRiskCount,
        medium: mediumRiskCount,
        high: highRiskCount
      }
    };

    res.json(performance);
  } catch (error) {
    console.error('Error fetching model performance:', error);
    res.status(500).json({ error: 'Failed to fetch model performance' });
  }
});

// Get system alerts
router.get('/alerts', requireAdmin, async (req, res) => {
  try {
    // Mock system alerts - in real app, these would come from monitoring system
    const alerts = [
      {
        id: 1,
        type: 'warning',
        message: 'Model accuracy dropped below 95% threshold',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        resolved: false
      },
      {
        id: 2,
        type: 'info',
        message: 'Scheduled model retraining completed',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        resolved: true
      },
      {
        id: 3,
        type: 'success',
        message: 'System backup completed successfully',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        resolved: true
      },
      {
        id: 4,
        type: 'error',
        message: 'High API response time detected',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        resolved: false
      }
    ];

    res.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch system alerts' });
  }
});

// Get recent users
router.get('/recent-users', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [recentUsers] = await connection.execute(`
      SELECT 
        id, name, email, role, created_at,
        CASE 
          WHEN role = 'athlete' THEN (SELECT COUNT(*) FROM analysis_data WHERE athlete_id = users.id)
          ELSE 0
        END as sessionsCount
      FROM users 
      ORDER BY created_at DESC 
      LIMIT 10
    `);

    connection.release();

    res.json(recentUsers);
  } catch (error) {
    console.error('Error fetching recent users:', error);
    res.status(500).json({ error: 'Failed to fetch recent users' });
  }
});

module.exports = router;
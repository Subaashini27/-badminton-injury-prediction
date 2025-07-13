const express = require('express');
const { pool } = require('../database');

const router = express.Router();

// Coach Dashboard Route
router.get('/:id/dashboard', async (req, res) => {
  try {
    const coachId = req.params.id;
    const { timeRange = 'week' } = req.query;
    
    const connection = await pool.getConnection();
    
    // Get coach's athletes
    const [athletes] = await connection.execute(`
      SELECT 
        a.id,
        u.name,
        a.age,
        a.experience,
        a.level,
        a.training_plan,
        a.last_active,
        COALESCE(ad.overall_risk, 0) as risk_level
      FROM athletes a
      JOIN users u ON a.user_id = u.id
      LEFT JOIN (
        SELECT 
          athlete_id,
          overall_risk,
          ROW_NUMBER() OVER (PARTITION BY athlete_id ORDER BY analysis_date DESC) as rn
        FROM analysis_data
      ) ad ON a.id = ad.athlete_id AND ad.rn = 1
      WHERE a.coach_id = ?
    `, [coachId]);
    
    // Get risk distribution
    const riskDistribution = {
      high: athletes.filter(a => a.risk_level > 0.7).length,
      medium: athletes.filter(a => a.risk_level > 0.4 && a.risk_level <= 0.7).length,
      low: athletes.filter(a => a.risk_level <= 0.4).length
    };
    
    // Get recent analyses
    const [recentAnalyses] = await connection.execute(`
      SELECT 
        ad.*,
        u.name as athlete_name
      FROM analysis_data ad
      JOIN athletes a ON ad.athlete_id = a.id
      JOIN users u ON a.user_id = u.id
      WHERE a.coach_id = ?
      ORDER BY ad.analysis_date DESC
      LIMIT 10
    `, [coachId]);
    
    // Get pending alerts (high risk athletes)
    const [pendingAlerts] = await connection.execute(`
      SELECT 
        u.name as athlete_name,
        COALESCE(ad.overall_risk, 0) as risk_level
      FROM athletes a
      JOIN users u ON a.user_id = u.id
      LEFT JOIN (
        SELECT 
          athlete_id,
          overall_risk,
          ROW_NUMBER() OVER (PARTITION BY athlete_id ORDER BY analysis_date DESC) as rn
        FROM analysis_data
      ) ad ON a.id = ad.athlete_id AND ad.rn = 1
      WHERE a.coach_id = ? AND COALESCE(ad.overall_risk, 0) > 0.6
    `, [coachId]);
    
    connection.release();
    
    res.json({
      athletes,
      riskDistribution,
      recentAnalyses,
      pendingAlerts: pendingAlerts.map(alert => ({
        athleteName: alert.athlete_name,
        level: alert.risk_level > 0.8 ? 'high' : 'medium'
      }))
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get coach's athletes
router.get('/:id/athletes', async (req, res) => {
  try {
    const coachId = req.params.id;
    
    const connection = await pool.getConnection();
    const [athletes] = await connection.execute(`
      SELECT 
        a.id,
        u.name,
        u.email,
        a.age,
        a.experience,
        a.level,
        a.training_plan,
        a.last_active,
        COALESCE(ad.overall_risk, 0) as risk_level
      FROM athletes a
      JOIN users u ON a.user_id = u.id
      LEFT JOIN (
        SELECT 
          athlete_id,
          overall_risk,
          ROW_NUMBER() OVER (PARTITION BY athlete_id ORDER BY analysis_date DESC) as rn
        FROM analysis_data
      ) ad ON a.id = ad.athlete_id AND ad.rn = 1
      WHERE a.coach_id = ?
      ORDER BY u.name
    `, [coachId]);
    
    connection.release();
    
    res.json(athletes);
  } catch (error) {
    console.error('Athletes error:', error);
    res.status(500).json({ error: 'Failed to fetch athletes' });
  }
});

// Get coach's injury reports
router.get('/:id/injury-reports', async (req, res) => {
  try {
    const coachId = req.params.id;
    
    const connection = await pool.getConnection();
    const [reports] = await connection.execute(`
      SELECT 
        ir.*,
        u.name as athlete_name
      FROM injury_reports ir
      JOIN athletes a ON ir.athlete_id = a.id
      JOIN users u ON a.user_id = u.id
      WHERE a.coach_id = ?
      ORDER BY ir.date_occurred DESC
    `, [coachId]);
    
    connection.release();
    
    res.json(reports);
  } catch (error) {
    console.error('Get injury reports error:', error);
    res.status(500).json({ error: 'Failed to fetch injury reports' });
  }
});

// Get coach's training sessions
router.get('/:id/training-sessions', async (req, res) => {
  try {
    const coachId = req.params.id;
    
    const connection = await pool.getConnection();
    const [sessions] = await connection.execute(`
      SELECT * FROM training_sessions 
      WHERE coach_id = ? 
      ORDER BY session_date DESC, session_time DESC
    `, [coachId]);
    
    connection.release();
    
    res.json(sessions);
  } catch (error) {
    console.error('Get training sessions error:', error);
    res.status(500).json({ error: 'Failed to fetch training sessions' });
  }
});

// Get all training plans for a coach
router.get('/:id/training-plans', async (req, res) => {
  try {
    const coachId = req.params.id;
    const connection = await pool.getConnection();

    const [plans] = await connection.execute(
      'SELECT * FROM training_plans WHERE coach_id = ?',
      [coachId]
    );

    for (const plan of plans) {
      const [exercises] = await connection.execute(
        'SELECT * FROM exercises WHERE plan_id = ?',
        [plan.id]
      );
      plan.exercises = exercises;
    }

    connection.release();
    res.json(plans);
  } catch (error) {
    console.error('Get training plans error:', error);
    res.status(500).json({ error: 'Failed to fetch training plans' });
  }
});

// Create a new training plan
router.post('/:id/training-plans', async (req, res) => {
  try {
    const coachId = req.params.id;
    const { name, description, duration, level, category, exercises } = req.body;

    // Validate input
    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required' });
    }

    const connection = await pool.getConnection();

    // Insert the training plan
    const [result] = await connection.execute(
      `INSERT INTO training_plans (coach_id, name, description, duration, level, category)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [coachId, name, description, duration, level, category]
    );

    const planId = result.insertId;

    // Insert exercises if any
    if (exercises && exercises.length > 0) {
      const exerciseValues = exercises.map(ex => 
        [planId, ex.name, ex.description, ex.duration, ex.sets, ex.reps, ex.targetArea, ex.instructions]
      );
      await connection.query(
        `INSERT INTO exercises (plan_id, name, description, duration, sets, reps, target_area, instructions)
         VALUES ?`,
        [exerciseValues]
      );
    }

    connection.release();

    res.status(201).json({ id: planId, ...req.body });

  } catch (error) {
    console.error('Create training plan error:', error);
    res.status(500).json({ error: 'Failed to create training plan' });
  }
});

module.exports = router; 
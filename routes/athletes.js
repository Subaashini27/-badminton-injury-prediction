const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../database');

const router = express.Router();

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const jwt = require('jsonwebtoken');
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Create new athlete
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, email, age, experience, level, training_plan, coach_id } = req.body;
    
    const connection = await pool.getConnection();
    
    // Create user account for athlete
    const hashedPassword = await bcrypt.hash('defaultpassword123', 10);
    const [userResult] = await connection.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'athlete']
    );
    
    const userId = userResult.insertId;
    
    // Create athlete record
    await connection.execute(
      'INSERT INTO athletes (user_id, coach_id, age, experience, level, training_plan) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, coach_id, age, experience, level, training_plan]
    );
    
    connection.release();
    
    res.status(201).json({ message: 'Athlete created successfully' });
  } catch (error) {
    console.error('Create athlete error:', error);
    res.status(500).json({ error: 'Failed to create athlete' });
  }
});

// Get athlete analysis data
router.get('/:id/analysis', authenticateToken, async (req, res) => {
  try {
    const athleteId = req.params.id;
    const { limit = 50 } = req.query;
    
    const connection = await pool.getConnection();
    const [analyses] = await connection.execute(`
      SELECT * FROM analysis_data 
      WHERE athlete_id = ? 
      ORDER BY analysis_date DESC 
      LIMIT ?
    `, [athleteId, parseInt(limit)]);
    
    connection.release();
    
    res.json(analyses);
  } catch (error) {
    console.error('Get analysis error:', error);
    res.status(500).json({ error: 'Failed to fetch analysis data' });
  }
});

// Save analysis data
router.post('/analysis', authenticateToken, async (req, res) => {
  try {
    // Destructure all expected metrics from the request body
    const { 
      athlete_id, 
      session_duration, 
      notes,
      overall_score,
      shotQuality,
      movementMetrics,
      physicalMetrics,
      technicalMetrics
    } = req.body;

    // Flatten the nested metric objects for database insertion
    const dbMetrics = {
      smash_power: shotQuality?.smashPower || 0,
      clear_height: shotQuality?.clearHeight || 0,
      drop_shot_precision: shotQuality?.dropShotPrecision || 0,
      net_shot_accuracy: shotQuality?.netShotAccuracy || 0,
      court_coverage: movementMetrics?.courtCoverage || 0,
      recovery_speed: movementMetrics?.recoverySpeed || 0,
      footwork_efficiency: movementMetrics?.footworkEfficiency || 0,
      reaction_time: movementMetrics?.reactionTime || 0,
      stamina: physicalMetrics?.stamina || 0,
      agility: physicalMetrics?.agility || 0,
      strength: physicalMetrics?.strength || 0,
      flexibility: physicalMetrics?.flexibility || 0,
      racket_control: technicalMetrics?.racketControl || 0,
      stroke_precision: technicalMetrics?.strokePrecision || 0,
      tactical_awareness: technicalMetrics?.tacticalAwareness || 0,
      consistency: technicalMetrics?.consistency || 0
    };

    const connection = await pool.getConnection();
    await connection.execute(`
      INSERT INTO analysis_data (
        athlete_id, session_duration, notes, overall_score,
        smash_power, clear_height, drop_shot_precision, net_shot_accuracy,
        court_coverage, recovery_speed, footwork_efficiency, reaction_time,
        stamina, agility, strength, flexibility,
        racket_control, stroke_precision, tactical_awareness, consistency
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      athlete_id, session_duration, notes, overall_score,
      dbMetrics.smash_power, dbMetrics.clear_height, dbMetrics.drop_shot_precision, dbMetrics.net_shot_accuracy,
      dbMetrics.court_coverage, dbMetrics.recovery_speed, dbMetrics.footwork_efficiency, dbMetrics.reaction_time,
      dbMetrics.stamina, dbMetrics.agility, dbMetrics.strength, dbMetrics.flexibility,
      dbMetrics.racket_control, dbMetrics.stroke_precision, dbMetrics.tactical_awareness, dbMetrics.consistency
    ]);
    
    // Update athlete's last_active
    await connection.execute(
      'UPDATE athletes SET last_active = CURRENT_TIMESTAMP WHERE id = ?',
      [athlete_id]
    );
    
    connection.release();
    
    res.status(201).json({ message: 'Analysis data saved successfully' });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Failed to save analysis data' });
  }
});

// Get training plan for a specific athlete
router.get('/:athleteId/training-plan', async (req, res) => {
  const { athleteId } = req.params;
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM training_plans WHERE athlete_id = ? ORDER BY last_updated DESC LIMIT 1',
      [athleteId]
    );
    connection.release();
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ error: 'No training plan found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Update/Create training plan for a specific athlete
router.post('/:athleteId/training-plan', async (req, res) => {
  const { athleteId } = req.params;
  const { plan_title, plan_description, duration, intensity, exercises } = req.body;
  try {
    const connection = await pool.getConnection();
    await connection.execute(
      `REPLACE INTO training_plans (athlete_id, plan_title, plan_description, duration, intensity, exercises)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [athleteId, plan_title, plan_description, duration, intensity, exercises]
    );
    connection.release();
    res.json({ message: 'Training plan updated' });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router; 
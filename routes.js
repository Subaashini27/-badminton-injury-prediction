const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('./database');

const router = express.Router();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Auth Routes
router.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password, role = 'athlete' } = req.body;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const connection = await pool.getConnection();
    
    // Create user
    const [userResult] = await connection.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );
    
    const userId = userResult.insertId;
    
    // If registering as athlete, create athlete record
    if (role === 'athlete') {
      await connection.execute(
        'INSERT INTO athletes (user_id) VALUES (?)',
        [userId]
      );
    }
    
    connection.release();
    
    // Generate JWT token
    const token = jwt.sign({ id: userId, email, role }, JWT_SECRET, { expiresIn: '24h' });
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: userId, name, email, role }
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Registration failed' });
    }
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const connection = await pool.getConnection();
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    connection.release();
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Coach Dashboard Routes
router.get('/coaches/:id/dashboard', authenticateToken, async (req, res) => {
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

// Athletes Routes
router.get('/coaches/:id/athletes', authenticateToken, async (req, res) => {
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

router.post('/athletes', authenticateToken, async (req, res) => {
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

// Analysis Data Routes
router.post('/analysis', authenticateToken, async (req, res) => {
  try {
    const { athlete_id, knee_risk, hip_risk, shoulder_risk, back_risk, overall_risk, session_duration, notes } = req.body;
    
    const connection = await pool.getConnection();
    await connection.execute(`
      INSERT INTO analysis_data 
      (athlete_id, knee_risk, hip_risk, shoulder_risk, back_risk, overall_risk, session_duration, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [athlete_id, knee_risk, hip_risk, shoulder_risk, back_risk, overall_risk, session_duration, notes]);
    
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

router.get('/athletes/:id/analysis', authenticateToken, async (req, res) => {
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

// Injury Reports Routes
router.post('/injury-reports', authenticateToken, async (req, res) => {
  try {
    const { athlete_id, injury_type, severity, description, date_occurred } = req.body;
    
    const connection = await pool.getConnection();
    await connection.execute(`
      INSERT INTO injury_reports 
      (athlete_id, injury_type, severity, description, date_occurred)
      VALUES (?, ?, ?, ?, ?)
    `, [athlete_id, injury_type, severity, description, date_occurred]);
    
    connection.release();
    
    res.status(201).json({ message: 'Injury report created successfully' });
  } catch (error) {
    console.error('Injury report error:', error);
    res.status(500).json({ error: 'Failed to create injury report' });
  }
});

router.get('/coaches/:id/injury-reports', authenticateToken, async (req, res) => {
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

module.exports = router; 
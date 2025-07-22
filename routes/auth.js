const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../database');

const router = express.Router();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Test route to verify the router is working
router.get('/test', (req, res) => {
  res.json({ message: 'Auth router is working' });
});

// Register route
router.post('/register', async (req, res) => {
  let connection;
  try {
    const { name, email, password, role = 'athlete' } = req.body;
    
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    
    // SECURITY: Prevent admin role creation through public registration
    if (role === 'admin') {
      return res.status(403).json({ 
        error: 'Admin accounts cannot be created through public registration. Please contact system administrator.' 
      });
    }
    
    // Validate role is either athlete or coach
    if (!['athlete', 'coach'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be either "athlete" or "coach"' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    connection = await pool.getConnection();
    
    // Create user
    const [userResult] = await connection.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );
    
    const userId = userResult.insertId;
    
    // If registering as athlete or coach, create corresponding record
    if (role === 'athlete') {
      await connection.execute(
        'INSERT INTO athletes (user_id) VALUES (?)',
        [userId]
      );
    } else if (role === 'coach') {
      await connection.execute(
        'INSERT INTO coaches (user_id) VALUES (?)',
        [userId]
      );
    }
    
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
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
      res.status(500).json({ error: 'Database connection failed' });
    } else {
      res.status(500).json({ error: 'Registration failed: ' + error.message });
    }
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Demo accounts for fallback when database is not available
const DEMO_ACCOUNTS = [
  { 
    id: 1, 
    email: 'demo@athlete.com', 
    password: 'password', 
    role: 'athlete', 
    name: 'Demo Athlete'
  },
  { 
    id: 2, 
    email: 'demo@coach.com', 
    password: 'password', 
    role: 'coach', 
    name: 'Demo Coach'
  },
  { 
    id: 3, 
    email: 'athlete@example.com', 
    password: 'password', 
    role: 'athlete', 
    name: 'Demo Athlete'
  },
  { 
    id: 4, 
    email: 'coach@example.com', 
    password: 'password', 
    role: 'coach', 
    name: 'Demo Coach'
  }
];

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    try {
      // Try database authentication first
      const connection = await pool.getConnection();
      const [users] = await connection.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      connection.release();
      
      if (users.length > 0) {
        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password);
        
        if (validPassword) {
          const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
          );
          
          return res.json({
            message: 'Login successful',
            token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role
            }
          });
        }
      }
    } catch (dbError) {
      console.log('Database unavailable, trying demo accounts...');
    }
    
    // Fallback to demo accounts
    const demoUser = DEMO_ACCOUNTS.find(acc => acc.email === email && acc.password === password);
    
    if (demoUser) {
      const token = jwt.sign(
        { id: demoUser.id, email: demoUser.email, role: demoUser.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      return res.json({
        message: 'Login successful (demo account)',
        token,
        user: {
          id: demoUser.id,
          name: demoUser.name,
          email: demoUser.email,
          role: demoUser.role
        }
      });
    }
    
    return res.status(401).json({ error: 'Invalid credentials' });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Admin-only route to create new admin users
router.post('/create-admin', requireAdmin, async (req, res) => {
  let connection;
  try {
    const { name, email, password } = req.body;
    
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    connection = await pool.getConnection();
    
    // Create admin user
    const [userResult] = await connection.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'admin']
    );
    
    const userId = userResult.insertId;
    
    connection.release();
    
    res.status(201).json({
      message: 'Admin user created successfully',
      user: { id: userId, name, email, role: 'admin' }
    });
  } catch (error) {
    console.error('Admin creation error:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create admin user' });
    }
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

module.exports = router;
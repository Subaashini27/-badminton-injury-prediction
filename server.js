const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { initializeDatabase, pool } = require('./database');
const authRoutes = require('./routes/auth');
const coachRoutes = require('./routes/coaches');
const athleteRoutes = require('./routes/athletes');
const feedbackRoutes = require('./routes/feedback');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// The database pool is now imported from 'database.js'
// and the local dbConfig and pool are removed to avoid inconsistency.

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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/coaches', authenticateToken, coachRoutes);
app.use('/api/athletes', authenticateToken, athleteRoutes);
app.use('/api/feedback', authenticateToken, feedbackRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Test DB connection route
app.get('/api/test-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1');
    res.send('✅ Database connected successfully!');
  } catch (err) {
    res.status(500).send('Database not connected');
  }
});

// Initialize database and start server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    app.listen(PORT, () => {
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log(`API Base URL: http://localhost:${PORT}/api`);
  });
}).catch(error => {
  process.exit(1);
}); 
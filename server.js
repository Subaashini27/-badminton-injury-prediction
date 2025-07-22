const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { initializeDatabase, query, isConnected } = require('./database-fallback');
const authRoutes = require('./routes/auth');
const coachRoutes = require('./routes/coaches');
const athleteRoutes = require('./routes/athletes');
const feedbackRoutes = require('./routes/feedback');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://badminton-injury.live',
    'https://www.badminton-injury.live',
    'https://courageous-sundae-6c35ce.netlify.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());
app.use(express.static('public'));

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

// Health check endpoint - must respond quickly for Railway
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: isConnected() ? 'connected' : 'fallback'
  });
});

// Test DB connection route
app.get('/api/test-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1');
    res.send('✅ Database connected successfully!');
  } catch (err) {
    res.status(500).send('❌ Database connection failed: ' + err.message);
  }
});

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/coaches', authenticateToken, coachRoutes);
app.use('/api/athletes', authenticateToken, athleteRoutes);
app.use('/api/feedback', authenticateToken, feedbackRoutes);
app.use('/api/admin', authenticateToken, adminRoutes);

// Start server immediately
try {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  });
  
  server.on('error', (error) => {
    console.error('❌ Server error:', error);
  });
} catch (error) {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
}

// Initialize database in background (non-blocking with shorter delay)
setTimeout(async () => {
  try {
    console.log('🔄 Initializing database in background...');
    await Promise.race([
      initializeDatabase(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Database init timeout')), 10000))
    ]);
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.log('⚠️  Server running with fallback data only');
  }
}, 100);
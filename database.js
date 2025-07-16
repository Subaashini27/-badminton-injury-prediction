require('dotenv').config();
const mysql = require('mysql2/promise');

// Database connection
const dbConfig = {
  host: process.env.MYSQL_HOST || process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || process.env.DB_PORT || '3306'),
  user: process.env.MYSQL_USER || process.env.DB_USER || 'root',
  password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD,
  database: process.env.MYSQL_DATABASE || process.env.DB_NAME || 'railway',
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  connectTimeout: 15000, // Increased timeout
  acquireTimeout: 15000,
  timeout: 15000,
  // SSL configuration for cloud databases
  ssl: process.env.NODE_ENV === 'production' ? { 
    rejectUnauthorized: false,
    // Add explicit SSL mode for Railway
    secureProtocol: 'TLSv1_2_method'
  } : false,
  // Additional configuration
  timezone: '+00:00',
  charset: 'utf8mb4',
  // Force IPv4 to avoid IPv6 localhost issues
  family: 4
};

// Debug logging for connection config
console.log('🔧 Database Configuration:', {
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  database: dbConfig.database,
  ssl: !!dbConfig.ssl,
  environment: process.env.NODE_ENV
});

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Initialize database tables
async function initializeDatabase() {
  const timeout = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Database connection timeout')), 15000) // Reduced from 30000
  );
  
  try {
    console.log('🔄 Attempting to connect to database...');
    console.log('🔗 Connection details:', {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database
    });
    const connection = await Promise.race([pool.getConnection(), timeout]);
    console.log('✅ Database connection successful!');
    
    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('coach', 'athlete', 'admin') DEFAULT 'athlete',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create athletes table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS athletes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        coach_id INT,
        age INT,
        experience VARCHAR(100),
        level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
        training_plan VARCHAR(255),
        last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (coach_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Create analysis_data table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS analysis_data (
        id INT AUTO_INCREMENT PRIMARY KEY,
        athlete_id INT NOT NULL,
        
        -- Old risk columns (can be deprecated or kept for other purposes)
        knee_risk DECIMAL(5,4) DEFAULT 0,
        hip_risk DECIMAL(5,4) DEFAULT 0,
        shoulder_risk DECIMAL(5,4) DEFAULT 0,
        back_risk DECIMAL(5,4) DEFAULT 0,
        overall_risk DECIMAL(5,4) DEFAULT 0,

        -- New performance metrics
        smash_power DECIMAL(5, 2) DEFAULT 0,
        clear_height DECIMAL(5, 2) DEFAULT 0,
        drop_shot_precision DECIMAL(5, 2) DEFAULT 0,
        net_shot_accuracy DECIMAL(5, 2) DEFAULT 0,
        court_coverage DECIMAL(5, 2) DEFAULT 0,
        recovery_speed DECIMAL(5, 2) DEFAULT 0,
        footwork_efficiency DECIMAL(5, 2) DEFAULT 0,
        reaction_time DECIMAL(5, 2) DEFAULT 0,
        stamina DECIMAL(5, 2) DEFAULT 0,
        agility DECIMAL(5, 2) DEFAULT 0,
        strength DECIMAL(5, 2) DEFAULT 0,
        flexibility DECIMAL(5, 2) DEFAULT 0,
        racket_control DECIMAL(5, 2) DEFAULT 0,
        stroke_precision DECIMAL(5, 2) DEFAULT 0,
        tactical_awareness DECIMAL(5, 2) DEFAULT 0,
        consistency DECIMAL(5, 2) DEFAULT 0,
        overall_score DECIMAL(5, 2) DEFAULT 0,
        
        analysis_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        session_duration INT DEFAULT 0,
        notes TEXT,
        FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE
      )
    `);

    // Create injury_reports table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS injury_reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        athlete_id INT NOT NULL,
        injury_type VARCHAR(255) NOT NULL,
        severity ENUM('mild', 'moderate', 'severe') DEFAULT 'mild',
        description TEXT,
        date_occurred DATE NOT NULL,
        status ENUM('active', 'recovering', 'recovered') DEFAULT 'active',
        recovery_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE
      )
    `);

    // Create training_sessions table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS training_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        coach_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        session_date DATE NOT NULL,
        session_time TIME NOT NULL,
        duration INT DEFAULT 60,
        max_participants INT DEFAULT 10,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (coach_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create session_participants table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS session_participants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id INT NOT NULL,
        athlete_id INT NOT NULL,
        status ENUM('registered', 'attended', 'absent') DEFAULT 'registered',
        notes TEXT,
        FOREIGN KEY (session_id) REFERENCES training_sessions(id) ON DELETE CASCADE,
        FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE,
        UNIQUE KEY unique_session_athlete (session_id, athlete_id)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS coaches (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS feedback (
        id INT AUTO_INCREMENT PRIMARY KEY,
        coach_id INT NOT NULL,
        athlete_id INT NOT NULL,
        message TEXT NOT NULL,
        priority ENUM('Low', 'Medium', 'High') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (coach_id) REFERENCES coaches(id) ON DELETE CASCADE,
        FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE
      )
    `);

    // Create training_plans table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS training_plans (
        id INT AUTO_INCREMENT PRIMARY KEY,
        coach_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        duration VARCHAR(100),
        level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
        category ENUM('injury-prevention', 'performance', 'rehabilitation') DEFAULT 'injury-prevention',
        status ENUM('active', 'inactive', 'draft') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (coach_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create exercises table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS exercises (
        id INT AUTO_INCREMENT PRIMARY KEY,
        plan_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        duration VARCHAR(50),
        sets INT DEFAULT 1,
        reps INT DEFAULT 1,
        target_area VARCHAR(100),
        instructions TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (plan_id) REFERENCES training_plans(id) ON DELETE CASCADE
      )
    `);

    // Create default admin user if it doesn't exist
    await createDefaultAdmin(connection);

    connection.release();
    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error.message);
    // Don't throw error, just log it
    console.log('Server will continue without database initialization');
  }
}

// Function to create default admin user
async function createDefaultAdmin(connection) {
  try {
    // Check if admin already exists
    const [existingAdmins] = await connection.execute(
      'SELECT COUNT(*) as count FROM users WHERE role = ?',
      ['admin']
    );

    if (existingAdmins[0].count === 0) {
      // Create default admin user
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await connection.execute(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['System Administrator', 'admin@badmintonsafe.com', hashedPassword, 'admin']
      );
    }
  } catch (error) {
    // Don't throw error here as it's not critical for system startup
    console.log('Admin user creation skipped:', error.message);
  }
}

module.exports = { pool, initializeDatabase }; 
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testNewRegistration() {
    console.log('🧪 Testing new user registration flow...');
    
    const dbConfig = {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false }
    };
    
    console.log('📋 Database config:', {
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        database: dbConfig.database
    });
    
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to Railway database');
        
        // Count users before
        const [beforeResult] = await connection.execute('SELECT COUNT(*) as count FROM users');
        const userCountBefore = beforeResult[0].count;
        console.log(`👥 Users before test: ${userCountBefore}`);
        
        // Test registration endpoint
        console.log('🔄 Testing registration endpoint...');
        const testUser = {
            name: `Test User ${Date.now()}`,
            email: `test_${Date.now()}@example.com`,
            password: 'testpassword123',
            role: 'athlete'
        };
        
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testUser)
        });
        
        const result = await response.json();
        console.log('📤 Registration response:', result);
        
        // Count users after
        const [afterResult] = await connection.execute('SELECT COUNT(*) as count FROM users');
        const userCountAfter = afterResult[0].count;
        console.log(`👥 Users after test: ${userCountAfter}`);
        
        if (userCountAfter > userCountBefore) {
            console.log('🎉 SUCCESS: New user was saved to Railway database!');
            console.log('✅ Your application is now working correctly for your demo!');
        } else {
            console.log('❌ ISSUE: User count did not increase - registration may have failed');
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testNewRegistration();
# Backend Setup Guide for Badminton Injury Prediction System

## Prerequisites

### 1. Install MySQL
Download and install MySQL Community Server from: https://dev.mysql.com/downloads/mysql/

### 2. Install Node.js (if not already installed)
Download from: https://nodejs.org/

## Setup Steps

### Step 1: Create Environment File
Create a file named `.env` in the root directory with the following content:

```
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=badminton_injury

# JWT Secret
JWT_SECRET=badminton-injury-secret-key-2024

# Server Configuration
PORT=5000

# Environment
NODE_ENV=development
```

**Important:** Replace `your_mysql_password` with your actual MySQL password.

### Step 2: Create MySQL Database
1. Open MySQL Workbench or MySQL Command Line Client
2. Run these commands:

```sql
CREATE DATABASE badminton_injury;
USE badminton_injury;
```

### Step 3: Install Backend Dependencies
The dependencies are already installed. If you need to reinstall:

```bash
npm install express cors mysql2 bcryptjs jsonwebtoken dotenv nodemon
```

### Step 4: Start the Backend Server
```bash
# Start the server
node server.js

# Or for development with auto-restart
npx nodemon server.js
```

### Step 5: Test the Backend
Open a new terminal and test the health endpoint:

```bash
curl http://localhost:5000/api/health
```

You should see: `{"status":"OK","message":"Server is running"}`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Coach Dashboard
- `GET /api/coaches/:id/dashboard` - Get coach dashboard data
- `GET /api/coaches/:id/athletes` - Get coach's athletes
- `GET /api/coaches/:id/injury-reports` - Get injury reports

### Athletes
- `POST /api/athletes` - Create new athlete
- `GET /api/athletes/:id/analysis` - Get athlete analysis data
- `POST /api/athletes/analysis` - Save analysis data

## Troubleshooting

### Common Issues:

1. **MySQL Connection Error**
   - Make sure MySQL is running
   - Check your password in .env file
   - Verify database exists

2. **Port Already in Use**
   - Change PORT in .env file
   - Or kill the process using port 5000

3. **Module Not Found**
   - Run `npm install` again
   - Check if all dependencies are installed

## Sample Data

After starting the server, you can create test data:

### Register a Coach
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Coach John",
    "email": "coach@example.com",
    "password": "password123",
    "role": "coach"
  }'
```

### Register an Athlete
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Athlete Jane",
    "email": "athlete@example.com",
    "password": "password123",
    "role": "athlete"
  }'
```

## Next Steps

1. **Fix Frontend Components** - Update React components to use real API
2. **Test Integration** - Ensure frontend connects to backend
3. **Add More Features** - Implement additional functionality

## Support

If you encounter any issues:
1. Check the console for error messages
2. Verify all prerequisites are installed
3. Ensure database is running and accessible 
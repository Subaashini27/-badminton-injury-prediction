# 🏸 Badminton Injury Prediction System

A comprehensive AI-powered system for monitoring and predicting injury risks in badminton players using real-time movement analysis and machine learning.

![Badminton Injury Prediction](https://img.shields.io/badge/Status-Functional-green)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-brightgreen)
![AI/ML](https://img.shields.io/badge/AI-MediaPipe-orange)

## 🎯 Features

### 🏃‍♂️ **Real-time Movement Analysis**
- **Live Camera Analysis**: Real-time pose detection using MediaPipe
- **Video Upload Processing**: Analyze recorded training sessions
- **Joint Angle Calculations**: Precise biomechanical measurements
- **Instant Risk Assessment**: Color-coded risk indicators for body parts

### 📊 **Multi-Role Dashboard System**
- **👤 Athlete Dashboard**: Performance tracking, injury assessment, training plans
- **👨‍🏫 Coach Dashboard**: Team management, athlete monitoring, analytics
- **⚙️ Admin Panel**: System management, user administration, AI model monitoring

### 🧠 **AI-Powered Risk Assessment**
- **Multi-factor Analysis**: Joint angles, movement patterns, historical data
- **Risk Level Classification**: 
  - 🔴 High Risk (≥0.8)
  - 🟠 Medium Risk (≥0.6) 
  - 🟡 Moderate Risk (≥0.4)
  - 🟢 Low Risk (<0.4)

### 📈 **Progress Tracking & Analytics**
- **Historical Data Visualization**: Charts and trends over time
- **Session Comparison**: Performance metrics across sessions
- **Risk Progression**: Track improvement in movement patterns
- **Coach Feedback**: Real-time coaching insights and recommendations

## 🛠️ Technology Stack

### Frontend
- **React.js 18.2.0** - Modern UI framework
- **Tailwind CSS** - Utility-first styling
- **Chart.js** - Data visualization
- **MediaPipe** - Real-time pose detection
- **React Router** - Client-side routing

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### AI/ML
- **MediaPipe Pose** - Real-time pose estimation
- **TensorFlow.js** - Machine learning framework
- **Custom Risk Algorithms** - Biomechanical analysis

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- Modern web browser with camera access

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/Smash-Trackers.git
cd Smash-Trackers
```

2. **Install dependencies**
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
npm install --prefix ./backend
```

3. **Set up environment variables**
```bash
# Create .env file in root directory
cp .env.example .env

# Edit .env with your configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=badminton_injury
JWT_SECRET=your-secret-key
PORT=5000
```

4. **Set up database**
```sql
CREATE DATABASE badminton_injury;
USE badminton_injury;
```

5. **Start the application**
```bash
# Terminal 1: Start backend server
node server.js

# Terminal 2: Start frontend development server
npm start
```

6. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 👥 User Roles & Access

### 🏃‍♂️ Athlete Access
- **Default Credentials**: Register as athlete
- **Features**: Live analysis, performance tracking, injury assessment
- **Dashboard**: `/athlete`

### 👨‍🏫 Coach Access  
- **Default Credentials**: Register as coach
- **Features**: Team management, athlete monitoring, training plans
- **Dashboard**: `/coach`

### ⚙️ Admin Access
- **Default Credentials**: 
  - Email: `admin@smashtrackers.com`
  - Password: `admin123`
- **Features**: System management, user administration, AI monitoring
- **Dashboard**: `/admin`

## 📱 Usage Guide

### For Athletes
1. **Login** to your athlete account
2. **Start Live Analysis** from your dashboard
3. **Position yourself** in front of the camera
4. **Perform badminton movements** while system analyzes
5. **Review results** and recommendations
6. **Track progress** over time

### For Coaches
1. **Login** to your coach account
2. **View your athletes** and their performance
3. **Monitor risk levels** and trends
4. **Create training plans** for athletes
5. **Generate reports** and analytics
6. **Provide feedback** based on analysis

### For Admins
1. **Login** with admin credentials
2. **Monitor system health** and performance
3. **Manage users** (create, suspend, delete)
4. **Track AI model performance**
5. **View system logs** and analytics
6. **Configure system settings**

## 🔧 API Endpoints

### Authentication
```
POST /api/auth/register - Register new user
POST /api/auth/login - Login user
POST /api/auth/create-admin - Create admin (admin-only)
```

### Athletes
```
GET /api/athletes/:id - Get athlete profile
POST /api/athletes/analysis - Save analysis data
GET /api/athletes/:id/performance - Get performance metrics
```

### Coaches
```
GET /api/coaches/:id/dashboard - Get coach dashboard
GET /api/coaches/:id/athletes - Get coach's athletes
GET /api/coaches/:id/injury-reports - Get injury reports
```

### Admin
```
GET /api/admin/users - Get all users
POST /api/admin/users - Create user
PUT /api/admin/users/:id - Update user
DELETE /api/admin/users/:id - Delete user
```

## 📊 System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (Express)     │◄──►│   (MySQL)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   MediaPipe     │    │   JWT Auth      │    │   User Data     │
│   Pose Detection│    │   Middleware    │    │   Analytics     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Role-based Access Control** - Different permissions per role
- **Password Hashing** - bcryptjs for secure storage
- **CORS Protection** - Cross-origin request security
- **Input Validation** - Server-side data validation
- **Admin-only Routes** - Protected administrative functions

## 📈 Performance Metrics

- **Real-time Analysis**: <100ms response time
- **Pose Detection**: 30 FPS processing
- **Database Queries**: Optimized with indexes
- **Frontend Loading**: <2s initial load time
- **API Response**: <500ms average response

## 🐛 Known Issues & Limitations

### Current Limitations
- **Dataset Size**: Limited to 50 samples (development phase)
- **Movement Types**: Currently supports "clear" movements only
- **Injury Data**: Uses synthetic data for testing
- **Mobile Support**: Limited mobile responsiveness

### Planned Improvements
- [ ] Collect real injury data from badminton players
- [ ] Add support for more movement types (smash, drop, etc.)
- [ ] Implement email notifications
- [ ] Add mobile app support
- [ ] Enhance AI model accuracy

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow React best practices
- Use TypeScript for new components
- Write unit tests for new features
- Update documentation for API changes
- Follow the existing code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **MediaPipe** team for pose detection technology
- **Badminton community** for domain expertise
- **Open source contributors** for various libraries
- **Research community** for biomechanical insights

## 📞 Support

- **Documentation**: Check the `/docs` folder
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Contact project maintainers

## 🚀 Deployment

### Production Deployment
```bash
# Build frontend
npm run build

# Set production environment
NODE_ENV=production

# Start production server
npm start
```

### Docker Deployment
```bash
# Build Docker image
docker build -t Smash-Trackers .

# Run container
docker run -p 3000:3000 -p 5000:5000 Smash-Trackers
```

---

**Made with ❤️ for the badminton community**

*This project is designed to help badminton players improve their technique and reduce injury risks through AI-powered movement analysis.*
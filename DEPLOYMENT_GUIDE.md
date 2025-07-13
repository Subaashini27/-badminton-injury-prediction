# 🚀 Deployment Guide - Badminton Injury Prediction System

## Overview
This guide will help you deploy the full-stack application with:
- **Frontend**: React app deployed to Vercel
- **Backend**: Express API deployed to Railway
- **Database**: MySQL on Railway

## Prerequisites
- GitHub account
- Project pushed to GitHub
- Vercel account (free)
- Railway account (free)

## Step 1: Prepare for Deployment

### 1.1 Update Backend for Production
In `server.js`, ensure CORS is configured for production:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

### 1.2 Update Frontend API URL
In your React app, make sure API calls use the environment variable:

```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

## Step 2: Deploy Backend to Railway

### 2.1 Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub

### 2.2 Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository
4. Railway will auto-detect Node.js

### 2.3 Add MySQL Database
1. In your project, click "New"
2. Select "Database" → "MySQL"
3. Railway will create the database and set environment variables

### 2.4 Configure Environment Variables
1. Click on your backend service
2. Go to "Variables" tab
3. Add these variables:
   ```
   JWT_SECRET=your-secret-key-here
   NODE_ENV=production
   FRONTEND_URL=https://your-app.vercel.app
   ```

### 2.5 Deploy
1. Railway will automatically deploy
2. Click on your service to see the deployment URL
3. Copy this URL (e.g., `https://your-backend.railway.app`)

## Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub

### 3.2 Import Project
1. Click "New Project"
2. Import your GitHub repository
3. Select the root directory

### 3.3 Configure Build Settings
- **Framework Preset**: Create React App
- **Build Command**: `npm run build`
- **Output Directory**: `build`

### 3.4 Set Environment Variables
Add this variable:
```
REACT_APP_API_URL=https://your-backend.railway.app/api
```
(Use your actual Railway backend URL)

### 3.5 Deploy
1. Click "Deploy"
2. Wait for deployment (usually 2-3 minutes)
3. Get your frontend URL (e.g., `https://your-app.vercel.app`)

## Step 4: Update Backend CORS

1. Go back to Railway
2. Update the `FRONTEND_URL` environment variable:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
3. Railway will auto-redeploy

## Step 5: Initialize Database

### 5.1 Connect to Railway MySQL
1. In Railway, click on your MySQL database
2. Go to "Connect" tab
3. Copy the connection details

### 5.2 Run Database Initialization
You can either:
- Use MySQL Workbench with Railway credentials
- Or add a setup endpoint to your backend

## Step 6: Test Your Deployment

### 6.1 Test Backend
```bash
curl https://your-backend.railway.app/api/health
```

### 6.2 Test Frontend
1. Visit `https://your-app.vercel.app`
2. Try registering a new user
3. Test the live analysis feature

## Troubleshooting

### CORS Issues
If you get CORS errors:
1. Check `FRONTEND_URL` in Railway matches your Vercel URL
2. Ensure backend CORS configuration includes credentials

### Database Connection Issues
1. Check MySQL is running in Railway
2. Verify environment variables are set correctly
3. Check database initialization completed

### API Connection Issues
1. Verify `REACT_APP_API_URL` in Vercel is correct
2. Check backend is deployed and running
3. Test backend health endpoint directly

## Alternative Deployment Options

### Option 1: Render (Backend)
- Free tier available (spins down after 15 min)
- Need external MySQL (PlanetScale/Aiven)
- Good for testing

### Option 2: Netlify (Frontend)
- Similar to Vercel
- Good GitHub integration
- Free tier generous

### Option 3: Heroku (Full Stack)
- If you have access
- Can host both frontend and backend
- Includes MySQL addon

### Option 4: DigitalOcean App Platform
- $5/month minimum
- Better performance
- Managed MySQL available

## Production Checklist

- [ ] Change default admin password
- [ ] Set strong JWT_SECRET
- [ ] Enable HTTPS (automatic on Vercel/Railway)
- [ ] Set up error monitoring (Sentry)
- [ ] Configure backup strategy
- [ ] Set up domain name (optional)
- [ ] Enable rate limiting
- [ ] Set up logging service

## Monitoring

### Free Monitoring Options
1. **UptimeRobot** - Monitor uptime
2. **Sentry** - Error tracking
3. **LogDNA** - Log management
4. **Google Analytics** - User analytics

## Costs

### Free Tier Limits
- **Vercel**: Unlimited for personal use
- **Railway**: $5 credit/month
- **MySQL on Railway**: Included in credits

### Estimated Monthly Cost
- Starting: $0-5/month
- With custom domain: $10-15/month
- Production scale: $20-50/month

## Next Steps

1. Set up custom domain
2. Implement CI/CD pipeline
3. Add monitoring and analytics
4. Set up automated backups
5. Implement caching strategy

## Support

If you encounter issues:
1. Check deployment logs in Vercel/Railway
2. Verify all environment variables
3. Test each component separately
4. Check browser console for errors

---

**Congratulations! Your Badminton Injury Prediction System is now live! 🎉** 
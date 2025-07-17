# Admin Setup Guide for Badminton Injury Prediction System

## Overview

This guide explains how to set up and access the admin panel in your badminton injury prediction system. The admin system is designed with security best practices where:

- **Admin users are NOT created through public registration**
- **A default admin is automatically created during system setup**
- **Only existing admins can create new admin users**
- **Admin accounts have full system access and management capabilities**

## Initial Setup

### Step 1: Start the Backend Server

```bash
# Navigate to your project directory
cd badminton_injury_prediction

# Start the backend server
node server.js
```

### Step 2: Check Console Output

When the server starts, you should see output similar to:

```
✅ Default admin user created successfully!
📧 Email: admin@smashtrackers.com
🔑 Password: admin123
⚠️  IMPORTANT: Change these credentials after first login!
```

**Note**: If you see "ℹ️ Admin user already exists, skipping creation.", it means an admin user was already created.

### Step 3: Access the Admin Panel

1. **Open your browser** and go to your application (typically `http://localhost:3000`)
2. **Click "Sign in"** or navigate to `/login`
3. **Use the default admin credentials**:
   - Email: `admin@smashtrackers.com`
   - Password: `admin123`
4. **You will be automatically redirected** to `/admin/dashboard`

## Admin Panel Features

Once logged in as admin, you have access to:

### 1. Dashboard Overview (`/admin/dashboard`)
- System statistics and health monitoring
- User activity overview
- AI model performance metrics
- System alerts and notifications

### 2. AI Model Monitoring (`/admin/ai-monitoring`)
- Monitor AI model performance
- View prediction accuracy
- Check model health status
- Review training data statistics

### 3. User Management (`/admin/users`)
- View all system users (athletes, coaches, admins)
- Filter users by role, status, or search terms
- Create new admin users (admin-only feature)
- Suspend/activate user accounts
- Export user data
- View detailed user statistics

### 4. System Logs (`/admin/logs`)
- View system activity logs
- Monitor error logs
- Track user actions
- Export log data

## Creating Additional Admin Users

### Method 1: Through Admin Panel (Recommended)

1. **Login as admin** using the default credentials
2. **Navigate to User Management** (`/admin/users`)
3. **Click "Create Admin"** button
4. **Fill in the form**:
   - Name: Full name of the new admin
   - Email: Email address for login
   - Password: Secure password (minimum 8 characters)
   - Confirm Password: Repeat the password
5. **Click "Create Admin"**

### Method 2: Direct API Call (Advanced)

```bash
curl -X POST http://localhost:5000/api/auth/create-admin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "New Admin Name",
    "email": "newadmin@example.com",
    "password": "securepassword123"
  }'
```

## Security Best Practices

### 1. Change Default Credentials
**IMPORTANT**: After your first login, immediately change the default admin password:

1. Go to User Management
2. Find your admin account
3. Update your password and email

### 2. Create Multiple Admin Accounts
- Create at least 2-3 admin accounts for redundancy
- Use different email addresses for each admin
- Store admin credentials securely

### 3. Regular Security Review
- Monitor user management logs
- Review system access patterns
- Keep admin accounts updated

## Troubleshooting

### Issue: Can't Access Admin Panel
**Symptoms**: Login works but you're redirected to athlete/coach dashboard

**Solutions**:
1. Check that your user has `role: 'admin'` in the database
2. Verify the user exists in the `users` table
3. Check browser console for any errors

### Issue: Default Admin Not Created
**Symptoms**: No admin creation message in console

**Solutions**:
1. Check database connection
2. Verify MySQL is running
3. Check database permissions
4. Look for error messages in server console

### Issue: Can't Create New Admin Users
**Symptoms**: "Create Admin" button doesn't work or shows errors

**Solutions**:
1. Ensure you're logged in as an admin user
2. Check that your JWT token is valid
3. Verify the backend API is running
4. Check browser network tab for API errors

## Database Verification

To verify admin users exist in your database:

```sql
-- Connect to your MySQL database
USE badminton_injury;

-- Check for admin users
SELECT id, name, email, role, created_at 
FROM users 
WHERE role = 'admin';
```

## API Endpoints for Admins

### Authentication
- `POST /api/auth/login` - Login (works for all users)
- `POST /api/auth/create-admin` - Create admin (admin-only)

### User Management (Admin-only)
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Support

If you encounter issues:

1. **Check server logs** for error messages
2. **Verify database connectivity**
3. **Ensure all dependencies are installed**
4. **Check browser console** for frontend errors
5. **Verify environment variables** are set correctly

## Next Steps

After setting up admin access:

1. **Configure system settings** in the admin panel
2. **Set up user registration policies**
3. **Configure AI model parameters**
4. **Set up monitoring and alerts**
5. **Create additional admin accounts** for team access

---

**Remember**: The admin panel gives you full control over the system. Use these privileges responsibly and always follow security best practices.
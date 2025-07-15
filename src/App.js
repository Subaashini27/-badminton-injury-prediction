import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AnalysisProvider } from './context/AnalysisContext';
import { NotificationProvider } from './context/NotificationContext';
import { AlertProvider } from './context/AlertContext';
import PrivateRoute from './components/auth/PrivateRoute';
import HomePage from './pages/HomePage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import AthleteDashboard from './pages/athlete/Dashboard';
import CoachDashboard from './pages/coach/Dashboard';
import AthleteProfile from './pages/athlete/Profile';
import CoachProfile from './pages/coach/Profile';
import TrainingPlans from './pages/athlete/TrainingPlans';
import InjuryReports from './pages/athlete/InjuryReports';
import InjuryAssessment from './pages/athlete/InjuryAssessment';
import Performance from './pages/athlete/Performance';
import AthleteLayout from './components/layout/AthleteLayout';
import CoachLayout from './components/layout/CoachLayout';
import AdminLayout from './components/layout/AdminLayout';
import Athletes from './pages/coach/Athletes';
import CoachAnalytics from './pages/coach/CoachAnalytics';
import CoachTrainingPlans from './pages/coach/TrainingPlans';
import CoachInjuryReports from './pages/coach/CoachInjuryReports';
import AdminDashboard from './pages/Admin/Dashboard';
import AIModelMonitoring from './pages/Admin/AIModelMonitoring';
import SystemLogs from './pages/Admin/SystemLogs';
import UserManagement from './pages/Admin/UserManagement';

const App = () => {
  return (
    <AlertProvider>
      <AuthProvider>
        <AnalysisProvider>
          <NotificationProvider>
            <Router>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Athlete Routes */}
                <Route path="/athlete" element={
                  <PrivateRoute allowedRoles={['athlete']}>
                        <AthleteLayout />
                  </PrivateRoute>
                }>
                  <Route index element={<AthleteDashboard />} />
                  <Route path="profile" element={<AthleteProfile />} />
                  <Route path="training-plans" element={<TrainingPlans />} />
                  <Route path="injury-reports" element={<InjuryReports />} />
                  <Route path="injury-assessment" element={<InjuryAssessment />} />
                  <Route path="performance" element={<Performance />} />
                </Route>

                {/* Coach Routes */}
                <Route path="/coach" element={
                  <PrivateRoute allowedRoles={['coach']}>
                      <CoachLayout />
                  </PrivateRoute>
                }>
                  <Route index element={<CoachDashboard />} />
                  <Route path="profile" element={<CoachProfile />} />
                  <Route path="athletes" element={<Athletes />} />
                  <Route path="training-plans" element={<CoachTrainingPlans />} />
                  <Route path="injury-reports" element={<CoachInjuryReports />} />
                  <Route path="analytics" element={<CoachAnalytics />} />
                </Route>

                {/* Admin Routes */}
                <Route path="/admin" element={
                  <PrivateRoute allowedRoles={['admin']}>
                      <AdminLayout />
                  </PrivateRoute>
                }>
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="ai-monitoring" element={<AIModelMonitoring />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="logs" element={<SystemLogs />} />
                </Route>

                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
          </NotificationProvider>
        </AnalysisProvider>
      </AuthProvider>
    </AlertProvider>
  );
};

export default App;
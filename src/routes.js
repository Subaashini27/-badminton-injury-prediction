import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AthleteDashboard from './pages/athlete/Dashboard';
import AthleteProfile from './pages/athlete/Profile';
import AthletePerformance from './pages/athlete/Performance'; 
import AthleteInjuries from './pages/athlete/Injuries';
import AthleteTraining from './pages/athlete/Training';
import InjuryAssessmentForm from './pages/athlete/InjuryAssessmentForm';
import CoachDashboard from './pages/coach/Dashboard';
import CoachProfile from './pages/coach/Profile';
import CoachAthletes from './pages/coach/Athletes';
import CoachInjuryAnalysis from './pages/coach/InjuryAnalysis';
import CoachTrainingPlans from './pages/coach/TrainingPlans';
import CoachInjuryReports from './pages/coach/CoachInjuryReports';
import Reports from './pages/coach/Reports';
import TrainingManagement from './pages/coach/TrainingManagement';
import AuthGuard from './pages/auth/AuthGuard';
import HomePage from './pages/HomePage';
import AthleteLayout from './components/layout/AthleteLayout';
import CoachLayout from './components/layout/CoachLayout';
import { AnalysisProvider } from './context/AnalysisContext';

// Simple placeholder component for routes that aren't fully implemented yet
// const PlaceholderPage = ({ title }) => (
//   <div className="flex h-screen flex-col items-center justify-center bg-gray-100">
//     <div className="bg-white p-8 rounded-lg shadow-md text-center">
//       <h1 className="text-2xl font-bold text-blue-800 mb-4">{title}</h1>
//       <p className="text-gray-600">This page is under construction</p>
//       <p className="mt-4">
//         <a href="/" className="text-blue-600 hover:underline">Return to home</a>
//       </p>
//     </div>
//   </div>
// );

// We'll use these components if the actual ones aren't implemented yet
const AthleteHome = () => <AthleteDashboard />;
const CoachHome = () => <CoachDashboard />;

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Athlete Routes */}
      <Route path="/athlete" element={
        <AuthGuard allowedRoles={['athlete']}>
          <AnalysisProvider>
            <AthleteLayout />
          </AnalysisProvider>
        </AuthGuard>
      }>
        <Route index element={<AthleteDashboard />} />
        <Route path="profile" element={<AthleteProfile />} />
        <Route path="performance" element={<AthletePerformance />} />
        <Route path="injuries" element={<AthleteInjuries />} />
        <Route path="training" element={<AthleteTraining />} />
        <Route path="injury-assessment" element={<InjuryAssessmentForm />} />
      </Route>

      {/* Coach Routes */}
      <Route path="/coach" element={
        <AuthGuard allowedRoles={['coach']}>
          <CoachLayout />
        </AuthGuard>
      }>
        <Route index element={<CoachDashboard />} />
        <Route path="profile" element={<CoachProfile />} />
        <Route path="athletes" element={<CoachAthletes />} />
        <Route path="injury-analysis" element={<CoachInjuryAnalysis />} />
        <Route path="injury-reports" element={<CoachInjuryReports />} />
        <Route path="training-plans" element={<CoachTrainingPlans />} />
        <Route path="reports" element={<Reports />} />
        <Route path="training-management" element={<TrainingManagement />} />
      </Route>

      {/* Legacy routes for backward compatibility */}
      <Route path="/athlete-dashboard" element={
        <Navigate to="/athlete" replace />
      } />
      <Route path="/coach-dashboard" element={
        <Navigate to="/coach" replace />
      } />

      {/* Default route - catch all unmatched routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
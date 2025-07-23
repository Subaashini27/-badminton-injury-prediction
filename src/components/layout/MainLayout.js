import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import RiskNotificationBell from '../notifications/RiskNotificationBell';

const MainLayout = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-white text-lg sm:text-xl font-bold">
                Badminton Injury Prevention
              </Link>
              
              {currentUser && (
                <nav className="hidden md:flex ml-6 lg:ml-10 space-x-2 lg:space-x-4">
                  <Link to="/dashboard" className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm lg:text-base">
                    Dashboard
                  </Link>
                  <Link to="/training-plans" className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm lg:text-base">
                    Training Plans
                  </Link>
                  <Link to="/wellness" className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm lg:text-base">
                    Wellness
                  </Link>
                  <Link to="/profile" className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm lg:text-base">
                    Profile
                  </Link>
                </nav>
              )}
            </div>

            {currentUser && (
              <div className="flex items-center space-x-2 sm:space-x-4">
                {currentUser.role === 'athlete' && (
                  <RiskNotificationBell />
                )}
                <div className="hidden sm:flex items-center space-x-2 text-white text-sm">
                  <span>
                    {currentUser.role === 'athlete' ? 'Athlete: ' : 'Coach: '}
                    {currentUser.name}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-white bg-blue-700 hover:bg-blue-800 px-3 sm:px-4 py-2 rounded-md text-sm"
                >
                  Logout
                </button>
                
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden text-white p-2"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          
          {/* Mobile Menu */}
          {currentUser && isMobileMenuOpen && (
            <div className="md:hidden pb-3">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <Link
                  to="/dashboard"
                  className="text-white hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/training-plans"
                  className="text-white hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Training Plans
                </Link>
                <Link
                  to="/wellness"
                  className="text-white hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Wellness
                </Link>
                <Link
                  to="/profile"
                  className="text-white hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <div className="sm:hidden px-3 py-2 text-white text-sm border-t border-blue-500 mt-2 pt-2">
                  {currentUser.role === 'athlete' ? 'Athlete: ' : 'Coach: '}
                  {currentUser.name}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
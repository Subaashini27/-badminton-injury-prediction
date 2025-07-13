import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const MainLayout = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

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
              <Link to="/" className="text-white text-xl font-bold">
                Badminton Injury Prevention
              </Link>
              
              {currentUser && (
                <nav className="ml-10 flex space-x-4">
                  <Link to="/dashboard" className="text-white hover:bg-blue-700 px-3 py-2 rounded-md">
                    Dashboard
                  </Link>
                  <Link to="/training-plans" className="text-white hover:bg-blue-700 px-3 py-2 rounded-md">
                    Training Plans
                  </Link>
                  <Link to="/wellness" className="text-white hover:bg-blue-700 px-3 py-2 rounded-md">
                    Wellness
                  </Link>
                  <Link to="/profile" className="text-white hover:bg-blue-700 px-3 py-2 rounded-md">
                    Profile
                  </Link>
                </nav>
              )}
            </div>

            {currentUser && (
              <div className="flex items-center space-x-4">
                <span className="text-white">
                  {currentUser.role === 'athlete' ? 'Athlete: ' : 'Coach: '}
                  {currentUser.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-white bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-md"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default MainLayout; 
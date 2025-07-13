import React from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaTachometerAlt, FaUser, FaUsers, FaClipboardCheck, FaFileAlt, FaChartLine, FaSignOutAlt } from 'react-icons/fa';

const navigationItems = [
  { path: '/coach', icon: <FaTachometerAlt />, label: 'Dashboard' },
  { path: '/coach/profile', icon: <FaUser />, label: 'Profile' },
  { path: '/coach/athletes', icon: <FaUsers />, label: 'Athletes' },
  { path: '/coach/training-plans', icon: <FaClipboardCheck />, label: 'Training Plans' },
  { path: '/coach/injury-reports', icon: <FaFileAlt />, label: 'Injury Reports' },
  { path: '/coach/analytics', icon: <FaChartLine />, label: 'Analytics' },
];

const CoachLayout = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-[#27378C] text-white flex flex-col justify-between">
        <div>
          <div className="p-6 text-2xl font-bold">BadmintonSafe</div>
          <nav className="mt-4 flex flex-col space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-6 py-3 text-base font-medium rounded-l-full transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-700 text-white'
                    : 'hover:bg-blue-600 hover:text-white'
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="p-6">
          <div className="mb-4 text-sm">
            <div>Logged in as:</div>
            <div className="font-semibold">{currentUser?.name || 'Demo Coach'}</div>
            <div className="capitalize">{currentUser?.role || 'Coach'}</div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
          >
            <FaSignOutAlt className="mr-2" />
            Logout
          </button>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 bg-gray-100">
        <Outlet />
      </main>
    </div>
  );
};

export default CoachLayout; 
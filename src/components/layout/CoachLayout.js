import React, { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaTachometerAlt, FaUser, FaUsers, FaClipboardCheck, FaFileAlt, FaChartLine, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';

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
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      // console.error('Failed to logout:', error);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity lg:hidden ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-[#27378C] text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:flex lg:flex-col lg:justify-between ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div>
          <div className="flex items-center justify-between p-4 sm:p-6">
            <div className="text-xl sm:text-2xl font-bold">BadmintonSafe</div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
              <FaTimes className="h-6 w-6" />
            </button>
          </div>
          <nav className="mt-4 flex flex-col space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-4 sm:px-6 py-3 text-sm sm:text-base font-medium rounded-l-full transition-colors ${
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
        <div className="p-4 sm:p-6 border-t border-blue-800">
          <div className="mb-4 text-sm">
            <div>Logged in as:</div>
            <div className="font-semibold">{currentUser?.name || 'Demo Coach'}</div>
            <div className="capitalize text-gray-300">{currentUser?.role || 'Coach'}</div>
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
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white shadow-md">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 focus:outline-none"
          >
            <FaBars className="h-6 w-6" />
          </button>
          <div className="text-lg font-semibold text-gray-700">Coach Dashboard</div>
          <div className="w-6"></div> {/* Spacer for center alignment */}
        </header>
        
        <main className="flex-1 bg-gray-100 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CoachLayout; 
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaTachometerAlt, FaUser, FaChartLine, FaFileAlt, FaClipboardList, FaClipboardCheck, FaSignOutAlt, FaTimes } from 'react-icons/fa';

const navigationItems = [
  { path: '/athlete', icon: <FaTachometerAlt />, label: 'Dashboard' },
  { path: '/athlete/profile', icon: <FaUser />, label: 'Profile' },
  { path: '/athlete/performance', icon: <FaChartLine />, label: 'Performance' },
  { path: '/athlete/injury-reports', icon: <FaFileAlt />, label: 'Injury Reports' },
  { path: '/athlete/injury-assessment', icon: <FaClipboardList />, label: 'Injury Assessment' },
  { path: '/athlete/training-plans', icon: <FaClipboardCheck />, label: 'Training Plans' },
];

const SideBar = ({ isSidebarOpen, setSidebarOpen }) => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      // console.error('Failed to logout:', error);
    }
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity lg:hidden ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-[#27378C] text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:flex lg:flex-col lg:justify-between ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="flex items-center justify-between p-6">
            <h1 className="text-2xl font-bold">Smash Trackers</h1>
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
                className={`flex items-center px-6 py-3 text-base font-medium transition-colors ${
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
        <div className="p-6 border-t border-blue-800">
          <div className="mb-4 text-sm">
            <div className="font-semibold">{currentUser?.name || 'Demo Athlete'}</div>
            <div className="text-gray-300 capitalize">{currentUser?.role || 'Athlete'}</div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
          >
            <FaSignOutAlt className="mr-2" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default SideBar;
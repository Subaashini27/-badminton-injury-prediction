import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigationItems = [
    {
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: '📊'
    },
    {
      name: 'AI Model Monitoring',
      path: '/admin/ai-monitoring',
      icon: '🤖'
    },
    {
      name: 'User Management',
      path: '/admin/users',
      icon: '👥'
    },
    {
      name: 'System Logs',
      path: '/admin/logs',
      icon: '📝'
    }
  ];

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`relative flex flex-col h-full ${isSidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300 ease-in-out`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className={`${isSidebarOpen ? 'block' : 'hidden'} flex items-center space-x-2`}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">🏸</span>
            </div>
            <span className="text-xl font-bold text-gray-800">Admin Panel</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="text-gray-600">
              {isSidebarOpen ? '◀' : '▶'}
            </span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-4 flex-1">
          {navigationItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center px-4 py-3 text-left hover:bg-blue-50 transition-colors ${
                isActiveRoute(item.path) 
                  ? 'bg-blue-100 border-r-4 border-blue-600 text-blue-700' 
                  : 'text-gray-700'
              }`}
            >
              <span className="text-xl mr-3">{item.icon}</span>
              <span className={`${isSidebarOpen ? 'block' : 'hidden'} font-medium`}>
                {item.name}
              </span>
            </button>
          ))}
        </nav>

        {/* Logout Button at Bottom */}
        <div className="p-4 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <span className="text-xl mr-2">🚪</span>
            <span className={`${isSidebarOpen ? 'block' : 'hidden'} font-medium`}>
              Logout
            </span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {navigationItems.find(item => isActiveRoute(item.path))?.name || 'Admin Dashboard'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg">
                <span className="text-xl">🔔</span>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              {/* System Status */}
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">System Online</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

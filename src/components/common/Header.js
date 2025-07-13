import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaBars, FaUserCircle } from 'react-icons/fa';
import NotificationCenter from './NotificationCenter';

const Header = ({ setSidebarOpen }) => {
  const { currentUser } = useAuth();

  return (
    <header className="flex items-center justify-between px-4 md:px-6 py-3 bg-white shadow-md">
      {/* Hamburger Menu for Mobile/Tablet */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="text-gray-500 focus:outline-none lg:hidden"
      >
        <FaBars className="h-6 w-6" />
      </button>

      {/* Can be a search bar or page title */}
      <div className="hidden lg:block">
        <h2 className="text-xl font-semibold text-gray-700">Dashboard</h2>
      </div>
      
      <div className="flex items-center space-x-4">
        <NotificationCenter />
        
        <div className="flex items-center space-x-2">
           <FaUserCircle className="h-8 w-8 text-gray-400" />
           <div className="hidden md:block">
             <div className="text-sm font-medium text-gray-700">{currentUser?.name}</div>
             <div className="text-xs text-gray-500 capitalize">{currentUser?.role}</div>
           </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
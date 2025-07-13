import React from 'react';
import { Link } from 'react-router-dom';

const SidebarItem = ({ icon, label, to, isActive }) => {
  return (
    <Link
      to={to}
      className={`flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors ${
        isActive ? 'bg-blue-50 text-blue-700' : ''
      }`}
    >
      {icon}
      <span className="ml-3">{label}</span>
    </Link>
  );
};

export default SidebarItem; 
import React, { useState, useEffect, useRef } from 'react';
import { useNotification } from '../../context/NotificationContext';

const RiskNotificationBell = () => {
  const { notifications, unreadCount, markAllAsRead, clearNotifications } = useNotification();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);



  const handleBellClick = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown) {
      // Mark all as read when opening
      markAllAsRead();
    }
  };

  const handleClearAll = () => {
    clearNotifications();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={handleBellClick}
        className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        
        {/* Red dot for unread notifications */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Risk Alerts</h3>
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No risk alerts
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 hover:bg-gray-50 ${!notif.read ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex items-start">
                      <div className={`w-2 h-2 rounded-full mt-1.5 mr-3 ${
                        notif.type === 'warning' ? 'bg-red-500' : 'bg-blue-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">
                          {notif.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          🕒 {new Date(notif.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <p className="text-xs text-gray-600 text-center">
                Showing last {notifications.length} alerts
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RiskNotificationBell;
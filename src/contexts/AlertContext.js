import React, { createContext, useContext, useState } from 'react';

// Alert types
export const ALERT_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Create context
const AlertContext = createContext();

// Custom hook to use the alert context
export const useAlert = () => {
  return useContext(AlertContext);
};

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);
  
  // Simple methods
  const success = (message) => {};
  const error = (message) => {};
  const dismissAlert = (id) => {};
  
  const value = {
    alerts,
    success,
    error,
    dismissAlert
  };
  
  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
};

export default AlertContext;
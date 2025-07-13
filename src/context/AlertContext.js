import React, { createContext, useContext, useState } from 'react';

const AlertContext = createContext();

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState(null);

  const success = (message) => {
    setAlert({ type: 'success', message });
    setTimeout(() => setAlert(null), 5000); // Clear after 5 seconds
  };

  const error = (message) => {
    setAlert({ type: 'error', message });
    setTimeout(() => setAlert(null), 5000); // Clear after 5 seconds
  };

  const clear = () => {
    setAlert(null);
  };

  return (
    <AlertContext.Provider value={{ alert, success, error, clear }}>
      {children}
      {alert && (
        <div
          className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
            alert.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}
          role="alert"
        >
          {alert.message}
        </div>
      )}
    </AlertContext.Provider>
  );
};

export default AlertContext; 
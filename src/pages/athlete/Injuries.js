import React from 'react';
import { useNavigate } from 'react-router-dom';

const Injuries = () => {
  const navigate = useNavigate();

  // Redirect to the comprehensive injury reports page
  React.useEffect(() => {
    navigate('/athlete/injury-reports', { replace: true });
  }, [navigate]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Redirecting to Injury Reports...</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Loading Injury Management System</h2>
          <p className="text-gray-600">Please wait while we redirect you to the comprehensive injury reporting system.</p>
        </div>
      </div>
    </div>
  );
};

export default Injuries; 
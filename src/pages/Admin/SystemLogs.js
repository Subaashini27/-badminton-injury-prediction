import React, { useState, useEffect } from 'react';

const SystemLogs = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Demo/mock data
    setLogs([
      { timestamp: '2024-07-13 20:00', user: 'admin@smashtrackers.com', action: 'Logged in', status: 'Success' },
      { timestamp: '2024-07-13 20:01', user: 'admin@smashtrackers.com', action: 'Viewed User Management', status: 'Success' },
      { timestamp: '2024-07-13 20:02', user: 'admin@smashtrackers.com', action: 'Created new admin', status: 'Success' },
      { timestamp: '2024-07-13 20:05', user: 'coach@example.com', action: 'Logged in', status: 'Success' },
      { timestamp: '2024-07-13 20:06', user: 'coach@example.com', action: 'Viewed Athlete List', status: 'Success' },
      { timestamp: '2024-07-13 20:10', user: 'athlete@example.com', action: 'Logged in', status: 'Success' },
      { timestamp: '2024-07-13 20:12', user: 'athlete@example.com', action: 'Submitted Injury Report', status: 'Success' },
      { timestamp: '2024-07-13 20:15', user: 'admin@smashtrackers.com', action: 'Exported User Data', status: 'Success' },
      { timestamp: '2024-07-13 20:20', user: 'admin@smashtrackers.com', action: 'Logged out', status: 'Success' },
    ]);
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">System Logs</h2>
      <div className="bg-white rounded-lg shadow p-4 overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Timestamp</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">User</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Action</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Status</th>
                </tr>
              </thead>
          <tbody className="divide-y divide-gray-200">
            {logs.map((log, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-sm text-gray-900">{log.timestamp}</td>
                <td className="px-4 py-2 text-sm text-blue-700">{log.user}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{log.action}</td>
                <td className="px-4 py-2 text-sm">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${log.status === 'Success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      <div className="mt-4 text-yellow-700 text-sm">⚠️ Demo data only. Connect to backend for real logs.</div>
    </div>
  );
};

export default SystemLogs;
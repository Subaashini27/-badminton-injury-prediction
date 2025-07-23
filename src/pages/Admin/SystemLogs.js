import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';

const SystemLogs = () => {
  const [logs, setLogs] = useState([]);
  const [, setLoading] = useState(true);
  const [, setError] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const logsData = await adminService.getSystemLogs();
        setLogs(logsData);
        setError(null);
      } catch (err) {
        setError('Failed to load system logs');
        // Fallback to empty array if API fails
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
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
    </div>
  );
};

export default SystemLogs;
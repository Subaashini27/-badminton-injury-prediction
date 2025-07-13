import React from 'react';

const SessionHistoryTable = ({ history }) => {
  return (
    <div className="bg-white shadow-lg rounded-2xl p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Session History</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">Date</th>
              <th scope="col" className="px-6 py-3">Overall Score</th>
              <th scope="col" className="px-6 py-3">Smash Power</th>
              <th scope="col" className="px-6 py-3">Court Coverage</th>
              <th scope="col" className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {history && history.length > 0 ? (
              history.map((session) => (
                <tr key={session.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4">{new Date(session.analysis_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{session.overall_score}</td>
                  <td className="px-6 py-4">{session.smash_power}</td>
                  <td className="px-6 py-4">{session.court_coverage}</td>
                  <td className="px-6 py-4">
                    <button className="font-medium text-blue-600 hover:underline">View Details</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No session history found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SessionHistoryTable; 
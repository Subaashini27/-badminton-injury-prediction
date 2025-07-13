import React, { useState } from 'react';

const TrainingManagement = () => {
  const [sessions, setSessions] = useState([
    { id: 1, name: 'Morning Drills', date: '2024-08-01', time: '09:00 AM', status: 'Upcoming' },
    { id: 2, name: 'Evening Practice', date: '2024-08-01', time: '06:00 PM', status: 'Upcoming' },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [newSession, setNewSession] = useState({ name: '', date: '', time: '' });

  const handleScheduleSession = () => {
    setSessions([...sessions, { ...newSession, id: Date.now(), status: 'Upcoming' }]);
    setShowModal(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Training Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Schedule New Session
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Upcoming Sessions</h2>
        <ul>
          {sessions.map(session => (
            <li key={session.id} className="border-b py-2 flex justify-between items-center">
              <div>
                <p className="font-semibold">{session.name}</p>
                <p className="text-sm text-gray-600">{session.date} at {session.time}</p>
              </div>
              <span className="px-2 py-1 text-sm rounded-full bg-green-200 text-green-800">
                {session.status}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h2 className="text-xl font-bold mb-4">New Training Session</h2>
            <input
              type="text"
              placeholder="Session Name"
              className="w-full p-2 border rounded mb-4"
              onChange={(e) => setNewSession({ ...newSession, name: e.target.value })}
            />
            <input
              type="date"
              className="w-full p-2 border rounded mb-4"
              onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
            />
            <input
              type="time"
              className="w-full p-2 border rounded mb-4"
              onChange={(e) => setNewSession({ ...newSession, time: e.target.value })}
            />
            <div className="flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="mr-2 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleSession}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingManagement;


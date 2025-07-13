import React, { useState, useEffect } from 'react';
import { useAuth } from '../../pages/auth/AuthContext';

const TeamManagement = () => {
  const { currentUser } = useAuth();
  const [athletes, setAthletes] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [newAthlete, setNewAthlete] = useState({
    name: '',
    email: '',
    age: '',
    experience: '',
    injuries: []
  });
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    // Fetch coach's athletes
    fetchAthletes();
  }, []);

  const fetchAthletes = async () => {
    try {
      // TODO: Implement API call to fetch athletes
      const response = await fetch(`/api/coaches/${currentUser.id}/athletes`);
      const data = await response.json();
      setAthletes(data);
    } catch (error) {
      console.error('Error fetching athletes:', error);
    }
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    try {
      // TODO: Implement API call to send invitation
      await fetch('/api/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: inviteEmail,
          coachId: currentUser.id
        }),
      });
      setInviteEmail('');
      setShowInviteForm(false);
    } catch (error) {
      console.error('Error sending invitation:', error);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      // TODO: Implement API call to create athlete
      await fetch('/api/athletes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newAthlete,
          coachId: currentUser.id
        }),
      });
      setNewAthlete({
        name: '',
        email: '',
        age: '',
        experience: '',
        injuries: []
      });
      setShowCreateForm(false);
      fetchAthletes();
    } catch (error) {
      console.error('Error creating athlete:', error);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Team Management</h2>
        <div className="space-x-4">
          <button
            onClick={() => setShowInviteForm(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Invite Athlete
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Create Athlete
          </button>
        </div>
      </div>

      {showInviteForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-semibold mb-4">Invite Athlete</h3>
            <form onSubmit={handleInviteSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowInviteForm(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-semibold mb-4">Create Athlete Profile</h3>
            <form onSubmit={handleCreateSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newAthlete.name}
                    onChange={(e) => setNewAthlete({ ...newAthlete, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newAthlete.email}
                    onChange={(e) => setNewAthlete({ ...newAthlete, email: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Age
                  </label>
                  <input
                    type="number"
                    value={newAthlete.age}
                    onChange={(e) => setNewAthlete({ ...newAthlete, age: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Experience Level
                  </label>
                  <select
                    value={newAthlete.experience}
                    onChange={(e) => setNewAthlete({ ...newAthlete, experience: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select experience level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="professional">Professional</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Create Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {athletes.map((athlete) => (
          <div key={athlete.id} className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold">{athlete.name}</h3>
            <p className="text-gray-600">{athlete.email}</p>
            <div className="mt-2">
              <span className="text-sm text-gray-500">Experience: </span>
              <span className="font-medium">{athlete.experience}</span>
            </div>
            <div className="mt-2">
              <span className="text-sm text-gray-500">Risk Level: </span>
              <span className={`font-medium ${
                athlete.riskLevel === 'high' ? 'text-red-500' :
                athlete.riskLevel === 'medium' ? 'text-yellow-500' :
                'text-green-500'
              }`}>
                {athlete.riskLevel.toUpperCase()}
              </span>
            </div>
            <div className="mt-4">
              <button
                onClick={() => {/* TODO: Navigate to athlete profile */}}
                className="text-blue-500 hover:text-blue-700"
              >
                View Profile →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamManagement; 
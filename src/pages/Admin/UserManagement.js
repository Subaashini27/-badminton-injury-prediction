import React, { useState, useEffect, useCallback } from 'react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    search: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [createAdminForm, setCreateAdminForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [createAdminLoading, setCreateAdminLoading] = useState(false);
  const [createAdminError, setCreateAdminError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = users;
    
    if (filters.role !== 'all') {
      filtered = filtered.filter(user => user.role === filters.role);
    }
    
    if (filters.status !== 'all') {
      filtered = filtered.filter(user => 
        filters.status === 'active' ? user.isActive : !user.isActive
      );
    }
    
    if (filters.search) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.email.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    setFilteredUsers(filtered);
  }, [users, filters]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const loadUsers = () => {
    setIsLoading(true);
    // Mock user data - in real app, this would come from backend
    const mockUsers = [
      {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'athlete',
        status: 'active',
        lastLogin: new Date(Date.now() - 1000 * 60 * 30),
        registrationDate: new Date('2024-01-10'),
        sessionsCount: 45,
        injuryReports: 3,
        riskLevel: 'medium'
      },
      {
        id: 2,
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        role: 'coach',
        status: 'active',
        lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 2),
        registrationDate: new Date('2024-01-05'),
        sessionsCount: 120,
        managedAthletes: 25,
        reportsGenerated: 15
      },
      {
        id: 3,
        name: 'Mike Wilson',
        email: 'mike.wilson@example.com',
        role: 'athlete',
        status: 'inactive',
        lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
        registrationDate: new Date('2023-12-20'),
        sessionsCount: 12,
        injuryReports: 1,
        riskLevel: 'low'
      },
      {
        id: 4,
        name: 'Emily Chen',
        email: 'emily.chen@example.com',
        role: 'athlete',
        status: 'active',
        lastLogin: new Date(Date.now() - 1000 * 60 * 15),
        registrationDate: new Date('2024-01-12'),
        sessionsCount: 67,
        injuryReports: 5,
        riskLevel: 'high'
      },
      {
        id: 5,
        name: 'David Brown',
        email: 'david.brown@example.com',
        role: 'coach',
        status: 'active',
        lastLogin: new Date(Date.now() - 1000 * 60 * 60),
        registrationDate: new Date('2023-11-15'),
        sessionsCount: 89,
        managedAthletes: 18,
        reportsGenerated: 8
      },
      {
        id: 6,
        name: 'Lisa Garcia',
        email: 'lisa.garcia@example.com',
        role: 'admin',
        status: 'active',
        lastLogin: new Date(Date.now() - 1000 * 60 * 10),
        registrationDate: new Date('2023-10-01'),
        sessionsCount: 200,
        systemActions: 156
      },
      {
        id: 7,
        name: 'Alex Taylor',
        email: 'alex.taylor@example.com',
        role: 'athlete',
        status: 'suspended',
        lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        registrationDate: new Date('2024-01-08'),
        sessionsCount: 8,
        injuryReports: 0,
        riskLevel: 'low',
        suspensionReason: 'Violation of terms of service'
      }
    ];

    setUsers(mockUsers);
    setIsLoading(false);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUserAction = (userId, action) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    switch (action) {
      case 'activate':
        setUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, status: 'active' } : u
        ));
        break;
      case 'suspend':
        if (window.confirm(`Are you sure you want to suspend ${user.name}?`)) {
          setUsers(prev => prev.map(u => 
            u.id === userId ? { ...u, status: 'suspended' } : u
          ));
        }
        break;
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
          setUsers(prev => prev.filter(u => u.id !== userId));
        }
        break;
      case 'view':
        setSelectedUser(user);
        setShowUserModal(true);
        break;
      default:
        break;
    }
  };

  const exportUsers = () => {
    const csv = [
      'Name,Email,Role,Status,Last Login,Registration Date,Sessions Count',
      ...filteredUsers.map(user => 
        `"${user.name}","${user.email}","${user.role}","${user.status}","${user.lastLogin.toISOString()}","${user.registrationDate.toISOString()}","${user.sessionsCount}"`
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    
    if (createAdminForm.password !== createAdminForm.confirmPassword) {
      setCreateAdminError('Passwords do not match');
      return;
    }
    
    if (createAdminForm.password.length < 8) {
      setCreateAdminError('Password must be at least 8 characters long');
      return;
    }
    
    try {
      setCreateAdminLoading(true);
      setCreateAdminError('');
      
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: createAdminForm.name,
          email: createAdminForm.email,
          password: createAdminForm.password
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create admin user');
      }
      
      // Reset form and close modal
      setCreateAdminForm({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      setShowCreateAdminModal(false);
      
      // Reload users list
      loadUsers();
      
      // Show success message
      alert('Admin user created successfully!');
      
    } catch (error) {
      setCreateAdminError(error.message);
    } finally {
      setCreateAdminLoading(false);
    }
  };

  const handleCreateAdminChange = (e) => {
    const { name, value } = e.target;
    setCreateAdminForm(prev => ({
      ...prev,
      [name]: value
    }));
    if (createAdminError) setCreateAdminError('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage system users and their permissions</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={exportUsers}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Export Users
          </button>
          <button 
            onClick={() => setShowCreateAdminModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            Create Admin
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Add New User
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
          <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
          <p className="text-2xl font-bold text-blue-600">{users.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
          <h3 className="text-sm font-medium text-gray-600">Active Users</h3>
          <p className="text-2xl font-bold text-green-600">
            {users.filter(user => user.status === 'active').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-yellow-500">
          <h3 className="text-sm font-medium text-gray-600">Athletes</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {users.filter(user => user.role === 'athlete').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-500">
          <h3 className="text-sm font-medium text-gray-600">Coaches</h3>
          <p className="text-2xl font-bold text-purple-600">
            {users.filter(user => user.role === 'coach').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select 
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="athlete">Athletes</option>
              <option value="coach">Coaches</option>
              <option value="admin">Admins</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select 
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search by name or email..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.lastLogin.toLocaleDateString()}
                    <div className="text-xs text-gray-500">
                      {user.lastLogin.toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="text-xs space-y-1">
                      <div>Sessions: {user.sessionsCount}</div>
                      {user.role === 'athlete' && (
                        <>
                          <div>Injuries: {user.injuryReports}</div>
                          <span className={`inline-flex px-1 py-0.5 text-xs rounded ${getRiskColor(user.riskLevel)}`}>
                            {user.riskLevel} risk
                          </span>
                        </>
                      )}
                      {user.role === 'coach' && (
                        <>
                          <div>Athletes: {user.managedAthletes}</div>
                          <div>Reports: {user.reportsGenerated}</div>
                        </>
                      )}
                      {user.role === 'admin' && (
                        <div>Actions: {user.systemActions}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleUserAction(user.id, 'view')}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      {user.status === 'active' ? (
                        <button 
                          onClick={() => handleUserAction(user.id, 'suspend')}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleUserAction(user.id, 'activate')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Activate
                        </button>
                      )}
                      <button 
                        onClick={() => handleUserAction(user.id, 'delete')}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No users found matching the current filters.</p>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">User Details</h3>
              <button 
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-600">Name:</span>
                <span className="ml-2">{selectedUser.name}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Email:</span>
                <span className="ml-2">{selectedUser.email}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Role:</span>
                <span className="ml-2 capitalize">{selectedUser.role}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Status:</span>
                <span className={`ml-2 px-2 py-1 text-xs rounded ${getStatusColor(selectedUser.status)}`}>
                  {selectedUser.status}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Registration:</span>
                <span className="ml-2">{selectedUser.registrationDate.toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Last Login:</span>
                <span className="ml-2">{selectedUser.lastLogin.toLocaleString()}</span>
              </div>
              {selectedUser.suspensionReason && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Suspension Reason:</span>
                  <span className="ml-2 text-red-600">{selectedUser.suspensionReason}</span>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button 
                onClick={() => setShowUserModal(false)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Close
              </button>
              <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                Edit User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Admin Modal */}
      {showCreateAdminModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create New Admin User</h3>
              <button 
                onClick={() => setShowCreateAdminModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={createAdminForm.name}
                  onChange={handleCreateAdminChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={createAdminForm.email}
                  onChange={handleCreateAdminChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={createAdminForm.password}
                  onChange={handleCreateAdminChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={createAdminForm.confirmPassword}
                  onChange={handleCreateAdminChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              {createAdminError && (
                <p className="text-red-500 text-sm">{createAdminError}</p>
              )}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateAdminModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createAdminLoading}
                  className="px-4 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createAdminLoading ? 'Creating...' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
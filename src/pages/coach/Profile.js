import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const CoachProfile = () => {
  const { currentUser, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    experience: currentUser?.experience || '',
    certifications: currentUser?.certifications || '',
    team: currentUser?.team || '',
    bio: currentUser?.bio || ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        experience: currentUser.experience || '',
        certifications: currentUser.certifications || '',
        team: currentUser.team || '',
        bio: currentUser.bio || ''
      });
    }
  }, [currentUser]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) newErrors.email = 'Invalid email address';
    if (formData.phone && !/^[0-9\-\+\(\)\s\.]{7,20}$/.test(formData.phone)) newErrors.phone = 'Invalid phone number';
    if (formData.experience && (isNaN(formData.experience) || formData.experience < 0 || formData.experience > 60)) newErrors.experience = 'Experience must be between 0 and 60 years';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSuccess(null);
    if (!validateForm()) {
      setFormError('Please fix the errors in the form');
      return;
    }
    try {
      setIsSaving(true);
      setFormError(null);
      await updateProfile(formData);
      setFormSuccess('Profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      setFormError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 p-8 bg-gray-100 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Coach Profile</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {formError && (
              <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{formError}</span>
              </div>
            )}
            {formSuccess && (
              <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Success: </strong>
                <span className="block sm:inline">{formSuccess}</span>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.name ? 'border-red-500' : ''}`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">Phone</label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.phone ? 'border-red-500' : ''}`}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="experience">Years of Coaching Experience</label>
                <input
                  type="number"
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.experience ? 'border-red-500' : ''}`}
                />
                {errors.experience && <p className="text-red-500 text-xs mt-1">{errors.experience}</p>}
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="certifications">Certifications</label>
                <input
                  type="text"
                  id="certifications"
                  name="certifications"
                  value={formData.certifications}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="team">Team/Club</label>
                <input
                  type="text"
                  id="team"
                  name="team"
                  value={formData.team}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="bio">Short Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows={4}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            {isEditing && (
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => { setIsEditing(false); setFormError(null); setFormSuccess(null); setErrors({}); setFormData({
                    name: currentUser?.name || '',
                    email: currentUser?.email || '',
                    phone: currentUser?.phone || '',
                    experience: currentUser?.experience || '',
                    certifications: currentUser?.certifications || '',
                    team: currentUser?.team || '',
                    bio: currentUser?.bio || ''
                  }); }}
                  className="ml-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline"
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
          {!isEditing && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-2">Profile Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><span className="font-medium">Full Name:</span> {formData.name}</div>
                <div><span className="font-medium">Email:</span> {formData.email}</div>
                <div><span className="font-medium">Phone:</span> {formData.phone}</div>
                <div><span className="font-medium">Experience:</span> {formData.experience} years</div>
                <div><span className="font-medium">Certifications:</span> {formData.certifications}</div>
                <div><span className="font-medium">Team/Club:</span> {formData.team}</div>
                <div className="md:col-span-2"><span className="font-medium">Bio:</span> {formData.bio}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoachProfile;





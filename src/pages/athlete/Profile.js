import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';

const Profile = () => {
  const { currentUser, updateProfile } = useAuth();
  const { success, error } = useAlert();
  const fileInputRef = useRef(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formData, setFormData] = useState({
    fullName: currentUser?.fullName || '',
    email: currentUser?.email || '',
    age: currentUser?.age || '',
    height: currentUser?.height || '',
    weight: currentUser?.weight || '',
    gender: currentUser?.gender || '',
    playingLevel: currentUser?.playingLevel || '',
    yearsOfExperience: currentUser?.yearsOfExperience || '',
    playingHand: currentUser?.playingHand || '',
    preferredShot: currentUser?.preferredShot || '',
    emergencyContact: currentUser?.emergencyContact || {
      name: '',
      relationship: '',
      phone: '',
      email: ''
    },
    goals: currentUser?.goals || ''
  });

  const [errors, setErrors] = useState({});
  const [photoURL, setPhotoURL] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        fullName: currentUser.fullName || '',
        email: currentUser.email || '',
        age: currentUser.age || '',
        height: currentUser.height || '',
        weight: currentUser.weight || '',
        gender: currentUser.gender || '',
        playingLevel: currentUser.playingLevel || '',
        yearsOfExperience: currentUser.yearsOfExperience || '',
        playingHand: currentUser.playingHand || '',
        preferredShot: currentUser.preferredShot || '',
        emergencyContact: currentUser.emergencyContact || {
          name: '',
          relationship: '',
          phone: '',
          email: ''
        },
        goals: currentUser.goals || ''
      });
      setPhotoURL(currentUser.photoURL || '');
    }
  }, [currentUser]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (formData.age && (isNaN(formData.age) || formData.age < 8 || formData.age > 100)) {
      newErrors.age = 'Age must be between 8 and 100';
    }

    if (formData.height && (isNaN(formData.height) || formData.height < 100 || formData.height > 250)) {
      newErrors.height = 'Height must be between 100cm and 250cm';
    }

    if (formData.weight && (isNaN(formData.weight) || formData.weight < 30 || formData.weight > 200)) {
      newErrors.weight = 'Weight must be between 30kg and 200kg';
    }

    // Emergency contact validation
    if (!formData.emergencyContact.name.trim()) {
      newErrors['emergencyContact.name'] = 'Emergency contact name is required';
    }
    if (!formData.emergencyContact.phone.trim()) {
      newErrors['emergencyContact.phone'] = 'Emergency contact phone is required';
    }
    // Fix unnecessary escape characters in phoneRegex
    const phoneRegex = /^[0-9\-+()\\s.]{7,20}$/;
    if (formData.emergencyContact.phone && !phoneRegex.test(formData.emergencyContact.phone)) {
      newErrors['emergencyContact.phone'] = 'Invalid phone number format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('emergencyContact.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      error('Please upload an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      error('Image size should be less than 5MB');
      return;
    }

    try {
      setIsUploading(true);
      // Here you would typically upload the file to your storage service
      // For now, we'll just create a local URL
      const url = URL.createObjectURL(file);
      setPhotoURL(url);
      success('Profile photo updated successfully');
    } catch (err) {
      error('Failed to upload profile photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      error('Please fix the errors in the form');
      return;
    }

    try {
      setIsSaving(true);
      setFormError(null);
      await updateProfile(formData);
      success('Profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      setFormError(err.message || 'Failed to update profile');
      error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
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
            {/* Error message */}
            {formError && (
              <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{formError}</span>
              </div>
            )}
            
            {/* Profile Photo Section */}
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div 
                  className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer overflow-hidden"
                  onClick={handlePhotoClick}
                >
                  {photoURL ? (
                    <img 
                      src={photoURL} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
              </div>
              <button
                type="button"
                onClick={handlePhotoClick}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Change photo
              </button>
            </div>

            {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                    errors.fullName ? 'border-red-300' : ''
                  }`}
                />
                {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
                    </div>

                    <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                    errors.email ? 'border-red-300' : ''
                  }`}
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                    </div>

                    <div>
                <label className="block text-sm font-medium text-gray-700">Age</label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                    errors.age ? 'border-red-300' : ''
                  }`}
                />
                {errors.age && <p className="mt-1 text-sm text-red-600">{errors.age}</p>}
                    </div>

                    <div>
                <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
                      <input
                        type="number"
                        name="height"
                        value={formData.height}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                    errors.height ? 'border-red-300' : ''
                  }`}
                />
                {errors.height && <p className="mt-1 text-sm text-red-600">{errors.height}</p>}
                    </div>

                    <div>
                <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                      <input
                        type="number"
                        name="weight"
                        value={formData.weight}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                    errors.weight ? 'border-red-300' : ''
                  }`}
                />
                {errors.weight && <p className="mt-1 text-sm text-red-600">{errors.weight}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                    </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Playing Level</label>
                <select
                  name="playingLevel"
                  value={formData.playingLevel}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="professional">Professional</option>
                </select>
                  </div>
                  
                  <div>
                <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
                    <input
                      type="number"
                  name="yearsOfExperience"
                  value={formData.yearsOfExperience}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Playing Hand</label>
                <input
                  type="text"
                  name="playingHand"
                  value={formData.playingHand}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
              <div>
                <label className="block text-sm font-medium text-gray-700">Preferred Shot</label>
                <input
                  type="text"
                  name="preferredShot"
                  value={formData.preferredShot}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            
            {/* Emergency Contact Information */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Emergency Contact</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Name</label>
                  <input
                    type="text"
                    name="emergencyContact.name"
                    value={formData.emergencyContact.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                      errors['emergencyContact.name'] ? 'border-red-300' : ''
                    }`}
                  />
                  {errors['emergencyContact.name'] && (
                    <p className="mt-1 text-sm text-red-600">{errors['emergencyContact.name']}</p>
                  )}
              </div>

                    <div>
                  <label className="block text-sm font-medium text-gray-700">Relationship</label>
                  <input
                    type="text"
                    name="emergencyContact.relationship"
                    value={formData.emergencyContact.relationship}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                    </div>

                    <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    name="emergencyContact.phone"
                    value={formData.emergencyContact.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                      errors['emergencyContact.phone'] ? 'border-red-300' : ''
                    }`}
                  />
                  {errors['emergencyContact.phone'] && (
                    <p className="mt-1 text-sm text-red-600">{errors['emergencyContact.phone']}</p>
                  )}
                    </div>

                    <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="emergencyContact.email"
                    value={formData.emergencyContact.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Goals</label>
              <textarea
                name="goals"
                value={formData.goals}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
          </div>

            {isEditing && (
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
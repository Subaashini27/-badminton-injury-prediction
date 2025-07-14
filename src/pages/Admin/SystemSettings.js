import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

/**
 * SystemSettings Component
 * 
 * Provides comprehensive system configuration management:
 * - AI Model Settings (thresholds, confidence levels, etc.)
 * - User Management Settings (registration, authentication, etc.)
 * - Notification Settings (alert thresholds, email preferences, etc.)
 * - System Performance Settings (refresh rates, timeout values, etc.)
 * - Security Settings (password policies, session timeouts, etc.)
 * - Data Management Settings (backup schedules, retention policies, etc.)
 * 
 * Features:
 * - Categorized settings with tabs
 * - Form validation and error handling
 * - Save/Reset functionality
 * - Real-time preview of changes
 * - Import/Export configuration
 * - Settings audit trail
 */
const SystemSettings = () => {
  const { currentUser } = useAuth();
  
  // State for active settings category
  const [activeCategory, setActiveCategory] = useState('ai-model');
  
  // State for loading and error handling
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // State for unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // State for system settings
  const [settings, setSettings] = useState({
    // AI Model Settings
    aiModel: {
      injuryRiskThreshold: 0.75,
      confidenceThreshold: 0.85,
      modelRefreshInterval: 24, // hours
      enableRealTimeAnalysis: true,
      maxPredictionTime: 5, // seconds
      enableModelLogging: true,
      modelVersion: 'v2.3.1',
      enableAutoRetraining: false,
      retrainingThreshold: 0.80,
      dataAugmentation: true
    },
    
    // User Management Settings
    userManagement: {
      enableUserRegistration: true,
      requireEmailVerification: true,
      defaultUserRole: 'athlete',
      maxLoginAttempts: 5,
      lockoutDuration: 30, // minutes
      passwordMinLength: 8,
      requireStrongPassword: true,
      enableTwoFactorAuth: false,
      sessionTimeout: 24, // hours
      enableGuestAccess: false
    },
    
    // Notification Settings
    notifications: {
      enableEmailNotifications: true,
      enablePushNotifications: true,
      highRiskThreshold: 0.8,
      mediumRiskThreshold: 0.6,
      notificationFrequency: 'immediate', // immediate, daily, weekly
      enableCoachAlerts: true,
      enableSystemAlerts: true,
      alertRetentionDays: 30,
      enableSMSNotifications: false,
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00'
    },
    
    // System Performance Settings
    performance: {
      dataRefreshInterval: 30, // seconds
      maxConcurrentUsers: 100,
      cacheTimeout: 300, // seconds
      enableDataCompression: true,
      logLevel: 'info', // debug, info, warning, error
      enablePerformanceMonitoring: true,
      maxFileUploadSize: 50, // MB
      enableCDN: false,
      databaseConnectionTimeout: 30, // seconds
      enableLoadBalancing: false
    },
    
    // Security Settings
    security: {
      enableSSL: true,
      enableCORS: true,
      allowedOrigins: ['localhost:3000'],
      enableRateLimiting: true,
      rateLimit: 100, // requests per minute
      enableIPWhitelist: false,
      whitelistedIPs: [],
      enableAuditLogging: true,
      encryptionAlgorithm: 'AES-256',
      enableCSRFProtection: true,
      enableXSSProtection: true
    },
    
    // Data Management Settings
    dataManagement: {
      enableAutoBackup: true,
      backupFrequency: 'daily', // daily, weekly, monthly
      backupRetentionDays: 30,
      enableDataEncryption: true,
      dataRetentionDays: 365,
      enableDataExport: true,
      enableDataImport: true,
      maxStorageSize: 10, // GB
      enableDataCompression: true,
      enableDataValidation: true
    }
  });
  
  // State for original settings (for reset functionality)
  const [originalSettings, setOriginalSettings] = useState({});

  /**
   * Load system settings from backend
   * In a real application, this would fetch from your backend API
   */
  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would fetch from your backend:
      // const response = await fetch('/api/admin/settings');
      // const data = await response.json();
      
      // For now, we'll use the default settings
      setOriginalSettings(JSON.parse(JSON.stringify(settings)));
      
    } catch (err) {
      setError('Failed to load system settings');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Save system settings to backend
   */
  const saveSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, you would send to your backend:
      // const response = await fetch('/api/admin/settings', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(settings)
      // });
      
      // Update original settings
      setOriginalSettings(JSON.parse(JSON.stringify(settings)));
      setHasUnsavedChanges(false);
      setSuccess('Settings saved successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Reset settings to original values
   */
  const resetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to their original values?')) {
      setSettings(JSON.parse(JSON.stringify(originalSettings)));
      setHasUnsavedChanges(false);
      setSuccess('Settings reset to original values');
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  /**
   * Reset to factory defaults
   */
  const resetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all settings to factory defaults? This action cannot be undone.')) {
      // This would typically load default settings from your backend
      setSuccess('Settings reset to factory defaults');
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  /**
   * Handle setting changes
   */
  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    
    // Mark as having unsaved changes
    setHasUnsavedChanges(true);
  };

  /**
   * Handle array setting changes (for whitelisted IPs, etc.)
   */
  const handleArraySettingChange = (category, key, index, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: prev[category][key].map((item, i) => i === index ? value : item)
      }
    }));
    setHasUnsavedChanges(true);
  };

  /**
   * Add item to array setting
   */
  const addArrayItem = (category, key, defaultValue = '') => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: [...prev[category][key], defaultValue]
      }
    }));
    setHasUnsavedChanges(true);
  };

  /**
   * Remove item from array setting
   */
  const removeArrayItem = (category, key, index) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: prev[category][key].filter((_, i) => i !== index)
      }
    }));
    setHasUnsavedChanges(true);
  };

  /**
   * Export settings to JSON file
   */
  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `system_settings_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  /**
   * Import settings from JSON file
   */
  const importSettings = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target.result);
          setSettings(importedSettings);
          setHasUnsavedChanges(true);
          setSuccess('Settings imported successfully');
          setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
          setError('Invalid settings file format');
        }
      };
      reader.readAsText(file);
    }
  };

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Categories for settings
  const categories = [
    { id: 'ai-model', name: 'AI Model', icon: '🤖' },
    { id: 'userManagement', name: 'User Management', icon: '👥' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' },
    { id: 'performance', name: 'Performance', icon: '⚡' },
    { id: 'security', name: 'Security', icon: '🔒' },
    { id: 'dataManagement', name: 'Data Management', icon: '💾' }
  ];

  /**
   * Render form input based on type
   */
  const renderInput = (category, key, value, type = 'text', options = []) => {
    switch (type) {
      case 'boolean':
        return (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleSettingChange(category, key, e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Enable</span>
          </label>
        );
      
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleSettingChange(category, key, e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleSettingChange(category, key, parseFloat(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        );
      
      case 'time':
        return (
          <input
            type="time"
            value={value}
            onChange={(e) => handleSettingChange(category, key, e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        );
      
      case 'array':
        return (
          <div className="space-y-2">
            {value.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleArraySettingChange(category, key, index, e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                />
                <button
                  onClick={() => removeArrayItem(category, key, index)}
                  className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={() => addArrayItem(category, key)}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Add Item
            </button>
          </div>
        );
      
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleSettingChange(category, key, e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
          <p className="text-gray-600">Configure system parameters and preferences</p>
        </div>
        <div className="flex space-x-3">
          <input
            type="file"
            accept=".json"
            onChange={importSettings}
            className="hidden"
            id="import-settings"
          />
          <label
            htmlFor="import-settings"
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 cursor-pointer"
          >
            Import Settings
          </label>
          <button
            onClick={exportSettings}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Export Settings
          </button>
          <button
            onClick={resetSettings}
            disabled={!hasUnsavedChanges}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50"
          >
            Reset Changes
          </button>
          <button
            onClick={resetToDefaults}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Factory Reset
          </button>
          <button
            onClick={saveSettings}
            disabled={saving || !hasUnsavedChanges}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {hasUnsavedChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            You have unsaved changes. Don't forget to save your settings.
          </p>
        </div>
      )}

      {/* Settings Navigation */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex-shrink-0 px-6 py-4 text-sm font-medium border-b-2 ${
                  activeCategory === category.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading settings...</span>
            </div>
          ) : (
            <>
              {/* AI Model Settings */}
              {activeCategory === 'ai-model' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">AI Model Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Injury Risk Threshold
                      </label>
                      {renderInput('aiModel', 'injuryRiskThreshold', settings.aiModel.injuryRiskThreshold, 'number')}
                      <p className="text-xs text-gray-500 mt-1">Risk level above which alerts are triggered (0-1)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confidence Threshold
                      </label>
                      {renderInput('aiModel', 'confidenceThreshold', settings.aiModel.confidenceThreshold, 'number')}
                      <p className="text-xs text-gray-500 mt-1">Minimum confidence for predictions (0-1)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Model Refresh Interval (hours)
                      </label>
                      {renderInput('aiModel', 'modelRefreshInterval', settings.aiModel.modelRefreshInterval, 'number')}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Prediction Time (seconds)
                      </label>
                      {renderInput('aiModel', 'maxPredictionTime', settings.aiModel.maxPredictionTime, 'number')}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enable Real-time Analysis
                      </label>
                      {renderInput('aiModel', 'enableRealTimeAnalysis', settings.aiModel.enableRealTimeAnalysis, 'boolean')}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enable Model Logging
                      </label>
                      {renderInput('aiModel', 'enableModelLogging', settings.aiModel.enableModelLogging, 'boolean')}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enable Auto-retraining
                      </label>
                      {renderInput('aiModel', 'enableAutoRetraining', settings.aiModel.enableAutoRetraining, 'boolean')}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data Augmentation
                      </label>
                      {renderInput('aiModel', 'dataAugmentation', settings.aiModel.dataAugmentation, 'boolean')}
                    </div>
                  </div>
                </div>
              )}

              {/* User Management Settings */}
              {activeCategory === 'userManagement' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">User Management Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enable User Registration
                      </label>
                      {renderInput('userManagement', 'enableUserRegistration', settings.userManagement.enableUserRegistration, 'boolean')}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Require Email Verification
                      </label>
                      {renderInput('userManagement', 'requireEmailVerification', settings.userManagement.requireEmailVerification, 'boolean')}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default User Role
                      </label>
                      {renderInput('userManagement', 'defaultUserRole', settings.userManagement.defaultUserRole, 'select', [
                        { value: 'athlete', label: 'Athlete' },
                        { value: 'coach', label: 'Coach' },
                        { value: 'admin', label: 'Admin' }
                      ])}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Login Attempts
                      </label>
                      {renderInput('userManagement', 'maxLoginAttempts', settings.userManagement.maxLoginAttempts, 'number')}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lockout Duration (minutes)
                      </label>
                      {renderInput('userManagement', 'lockoutDuration', settings.userManagement.lockoutDuration, 'number')}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Password Length
                      </label>
                      {renderInput('userManagement', 'passwordMinLength', settings.userManagement.passwordMinLength, 'number')}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Require Strong Password
                      </label>
                      {renderInput('userManagement', 'requireStrongPassword', settings.userManagement.requireStrongPassword, 'boolean')}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Session Timeout (hours)
                      </label>
                      {renderInput('userManagement', 'sessionTimeout', settings.userManagement.sessionTimeout, 'number')}
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeCategory === 'notifications' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Notification Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enable Email Notifications
                      </label>
                      {renderInput('notifications', 'enableEmailNotifications', settings.notifications.enableEmailNotifications, 'boolean')}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enable Push Notifications
                      </label>
                      {renderInput('notifications', 'enablePushNotifications', settings.notifications.enablePushNotifications, 'boolean')}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        High Risk Threshold
                      </label>
                      {renderInput('notifications', 'highRiskThreshold', settings.notifications.highRiskThreshold, 'number')}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Medium Risk Threshold
                      </label>
                      {renderInput('notifications', 'mediumRiskThreshold', settings.notifications.mediumRiskThreshold, 'number')}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notification Frequency
                      </label>
                      {renderInput('notifications', 'notificationFrequency', settings.notifications.notificationFrequency, 'select', [
                        { value: 'immediate', label: 'Immediate' },
                        { value: 'daily', label: 'Daily' },
                        { value: 'weekly', label: 'Weekly' }
                      ])}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alert Retention Days
                      </label>
                      {renderInput('notifications', 'alertRetentionDays', settings.notifications.alertRetentionDays, 'number')}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quiet Hours Start
                      </label>
                      {renderInput('notifications', 'quietHoursStart', settings.notifications.quietHoursStart, 'time')}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quiet Hours End
                      </label>
                      {renderInput('notifications', 'quietHoursEnd', settings.notifications.quietHoursEnd, 'time')}
                    </div>
                  </div>
                </div>
              )}

              {/* Performance Settings */}
              {activeCategory === 'performance' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Performance Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data Refresh Interval (seconds)
                      </label>
                      {renderInput('performance', 'dataRefreshInterval', settings.performance.dataRefreshInterval, 'number')}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Concurrent Users
                      </label>
                      {renderInput('performance', 'maxConcurrentUsers', settings.performance.maxConcurrentUsers, 'number')}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cache Timeout (seconds)
                      </label>
                      {renderInput('performance', 'cacheTimeout', settings.performance.cacheTimeout, 'number')}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max File Upload Size (MB)
                      </label>
                      {renderInput('performance', 'maxFileUploadSize', settings.performance.maxFileUploadSize, 'number')}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Log Level
                      </label>
                      {renderInput('performance', 'logLevel', settings.performance.logLevel, 'select', [
                        { value: 'debug', label: 'Debug' },
                        { value: 'info', label: 'Info' },
                        { value: 'warning', label: 'Warning' },
                        { value: 'error', label: 'Error' }
                      ])}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enable Data Compression
                      </label>
                      {renderInput('performance', 'enableDataCompression', settings.performance.enableDataCompression, 'boolean')}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enable Performance Monitoring
                      </label>
                      {renderInput('performance', 'enablePerformanceMonitoring', settings.performance.enablePerformanceMonitoring, 'boolean')}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Database Connection Timeout (seconds)
                      </label>
                      {renderInput('performance', 'databaseConnectionTimeout', settings.performance.databaseConnectionTimeout, 'number')}
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeCategory === 'security' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Security Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enable SSL
                      </label>
                      {renderInput('security', 'enableSSL', settings.security.enableSSL, 'boolean')}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enable CORS
                      </label>
                      {renderInput('security', 'enableCORS', settings.security.enableCORS, 'boolean')}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enable Rate Limiting
                      </label>
                      {renderInput('security', 'enableRateLimiting', settings.security.enableRateLimiting, 'boolean')}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rate Limit (requests/minute)
                      </label>
                      {renderInput('security', 'rateLimit', settings.security.rateLimit, 'number')}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enable IP Whitelist
                      </label>
                      {renderInput('security', 'enableIPWhitelist', settings.security.enableIPWhitelist, 'boolean')}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enable Audit Logging
                      </label>
                      {renderInput('security', 'enableAuditLogging', settings.security.enableAuditLogging, 'boolean')}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Encryption Algorithm
                      </label>
                      {renderInput('security', 'encryptionAlgorithm', settings.security.encryptionAlgorithm, 'select', [
                        { value: 'AES-256', label: 'AES-256' },
                        { value: 'AES-128', label: 'AES-128' },
                        { value: 'RSA-2048', label: 'RSA-2048' }
                      ])}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enable CSRF Protection
                      </label>
                      {renderInput('security', 'enableCSRFProtection', settings.security.enableCSRFProtection, 'boolean')}
                    </div>
                  </div>
                  
                  {/* Whitelisted IPs */}
                  {settings.security.enableIPWhitelist && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Whitelisted IP Addresses
                      </label>
                      {renderInput('security', 'whitelistedIPs', settings.security.whitelistedIPs, 'array')}
                    </div>
                  )}
                </div>
              )}

              {/* Data Management Settings */}
              {activeCategory === 'dataManagement' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Data Management Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enable Auto Backup
                      </label>
                      {renderInput('dataManagement', 'enableAutoBackup', settings.dataManagement.enableAutoBackup, 'boolean')}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Backup Frequency
                      </label>
                      {renderInput('dataManagement', 'backupFrequency', settings.dataManagement.backupFrequency, 'select', [
                        { value: 'daily', label: 'Daily' },
                        { value: 'weekly', label: 'Weekly' },
                        { value: 'monthly', label: 'Monthly' }
                      ])}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Backup Retention Days
                      </label>
                      {renderInput('dataManagement', 'backupRetentionDays', settings.dataManagement.backupRetentionDays, 'number')}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data Retention Days
                      </label>
                      {renderInput('dataManagement', 'dataRetentionDays', settings.dataManagement.dataRetentionDays, 'number')}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Storage Size (GB)
                      </label>
                      {renderInput('dataManagement', 'maxStorageSize', settings.dataManagement.maxStorageSize, 'number')}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enable Data Encryption
                      </label>
                      {renderInput('dataManagement', 'enableDataEncryption', settings.dataManagement.enableDataEncryption, 'boolean')}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enable Data Export
                      </label>
                      {renderInput('dataManagement', 'enableDataExport', settings.dataManagement.enableDataExport, 'boolean')}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enable Data Validation
                      </label>
                      {renderInput('dataManagement', 'enableDataValidation', settings.dataManagement.enableDataValidation, 'boolean')}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemSettings; 
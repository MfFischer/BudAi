// PrivacyCenter.js
import React, { useState } from 'react';
import { usePrivacy } from '../contexts/PrivacyContext';
import { Link, useNavigate } from 'react-router-dom';

const PrivacyCenter = () => {
  const { privacySettings, updatePrivacySettings } = usePrivacy();
  const [settings, setSettings] = useState({...privacySettings});
  const navigate = useNavigate();

  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSave = () => {
    updatePrivacySettings(settings);
    alert('Your privacy settings have been saved!');
  };

  const handleCancel = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-r from-indigo-500/20 to-purple-500/20">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 md:p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-white">Privacy Center</h1>
        
        <div className="space-y-6">
          <section className="border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Cookie Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-gray-800 dark:text-white block font-medium">Necessary Cookies</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Required for the website to function properly</p>
                </div>
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  className="form-checkbox h-5 w-5 text-blue-600 disabled:opacity-50"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-gray-800 dark:text-white block font-medium">Marketing Communications</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">For personalized ads and content</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.marketingConsent}
                  onChange={(e) => handleSettingChange('marketingConsent', e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-gray-800 dark:text-white block font-medium">Analytics</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Help us improve by analyzing usage patterns</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.analyticsConsent}
                  onChange={(e) => handleSettingChange('analyticsConsent', e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-gray-800 dark:text-white block font-medium">Preferences</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Remember your settings and preferences</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.preferences}
                  onChange={(e) => handleSettingChange('preferences', e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
              </div>
            </div>
          </section>
          
          <section className="border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Your Privacy Rights</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You can control how we use your data. Visit our <Link to="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link> to learn more.
            </p>
          </section>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyCenter;
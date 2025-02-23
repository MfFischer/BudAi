// PrivacyCenter.js
import React from 'react';
import { usePrivacy } from '../contexts/PrivacyContext';

const PrivacyCenter = () => {
  const { privacySettings, updatePrivacySettings } = usePrivacy();

  const handleSettingChange = (setting, value) => {
    const newSettings = {
      ...privacySettings,
      [setting]: value
    };
    updatePrivacySettings(newSettings);
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
      <div className="max-w-4xl mx-auto bg-[#151235] p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-white">Privacy Center</h1>
        
        <div className="space-y-6">
          <section className="bg-opacity-20 bg-white backdrop-blur-lg rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-4 text-white">Cookie Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white block font-medium">Necessary Cookies</label>
                  <p className="text-sm text-gray-400">Required for the website to function properly</p>
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
                  <label className="text-white block font-medium">Marketing Communications</label>
                  <p className="text-sm text-gray-400">For personalized ads and content</p>
                </div>
                <input
                  type="checkbox"
                  checked={privacySettings.marketingConsent}
                  onChange={(e) => handleSettingChange('marketingConsent', e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white block font-medium">Analytics</label>
                  <p className="text-sm text-gray-400">Help us improve by analyzing usage patterns</p>
                </div>
                <input
                  type="checkbox"
                  checked={privacySettings.analyticsConsent}
                  onChange={(e) => handleSettingChange('analyticsConsent', e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white block font-medium">Preferences</label>
                  <p className="text-sm text-gray-400">Remember your settings and preferences</p>
                </div>
                <input
                  type="checkbox"
                  checked={privacySettings.preferences}
                  onChange={(e) => handleSettingChange('preferences', e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
              </div>
            </div>
          </section>
          
          <section className="bg-opacity-20 bg-white backdrop-blur-lg rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-4 text-white">Your Privacy Rights</h2>
            <p className="text-gray-300 mb-4">
              You can control how we use your data. Visit our <a href="/privacy-policy" className="text-blue-400 hover:underline">Privacy Policy</a> to learn more.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyCenter;
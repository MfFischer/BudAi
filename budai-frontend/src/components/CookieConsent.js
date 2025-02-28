// CookieConsent.js
import React from 'react';
import { usePrivacy } from '../contexts/PrivacyContext';
import { Link } from 'react-router-dom';

const CookieConsent = () => {
  const { privacySettings, updatePrivacySettings } = usePrivacy();

  const handleAcceptAll = () => {
    updatePrivacySettings({
      ...privacySettings,
      necessary: true,
      marketingConsent: true,
      analyticsConsent: true,
      preferences: true
    });
  };

  const handleAcceptNecessary = () => {
    updatePrivacySettings({
      ...privacySettings,
      necessary: true,
      marketingConsent: false,
      analyticsConsent: false,
      preferences: false
    });
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 bg-white dark:bg-gray-800 shadow-lg">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div className="mb-4 md:mb-0 md:mr-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Cookie Settings Required</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              To use our chat service, you need to accept necessary cookies. 
              Please visit our <Link to="/privacy-center" className="text-blue-600 hover:underline">Privacy Center</Link> to manage your cookie preferences.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleAcceptNecessary}
              className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              Accept Necessary Only
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              Accept All
            </button>
            <Link
              to="/privacy-center"
              className="px-4 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Privacy Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
import React from 'react';

const CookieSettings = ({ onClose, onSave, preferences = {} }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg z-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <span role="img" aria-label="cookie" className="text-2xl">
              🍪
            </span>
            <div>
              <h3 className="text-gray-900 font-medium">Cookie Settings</h3>
              <p className="text-sm text-gray-500 mt-1">
                Manage your cookie preferences. You can change these settings at any time.
              </p>
            </div>
          </div>
          
          <div className="flex gap-2 whitespace-nowrap">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Close
            </button>
            <button
              onClick={() => onSave(preferences)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Update Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieSettings;
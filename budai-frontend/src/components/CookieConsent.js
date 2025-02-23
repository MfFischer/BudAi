import React, { useState } from 'react';

const ToggleSwitch = ({ isChecked, onChange, disabled = false }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      checked={isChecked}
      onChange={onChange}
      disabled={disabled}
      className="sr-only peer"
    />
    <div className={`
      w-11 h-6 
      ${disabled ? 'bg-blue-600 cursor-not-allowed' : isChecked ? 'bg-blue-600' : 'bg-gray-200'} 
      peer-focus:outline-none 
      rounded-full 
      peer 
      peer-checked:after:translate-x-full 
      after:content-[''] 
      after:absolute 
      after:top-[2px] 
      after:left-[2px] 
      after:bg-white 
      after:rounded-full 
      after:h-5 
      after:w-5 
      after:transition-all
    `}></div>
  </label>
);

const CookieConsent = ({ onAccept, onShowSettings }) => {
  const [activeTab, setActiveTab] = useState('consent');
  const [settings, setSettings] = useState({
    necessary: true,
    preferences: false,
    statistics: false,
    marketing: false
  });

  const handleToggle = (type) => {
    if (type === 'necessary') return;
    setSettings(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      preferences: true,
      statistics: true,
      marketing: true
    };
    setSettings(allAccepted);
    onAccept(allAccepted);
  };

  const handleRejectAll = () => {
    const allRejected = {
      necessary: true,
      preferences: false,
      statistics: false,
      marketing: false
    };
    setSettings(allRejected);
    onAccept(allRejected);
  };

  const handleSavePreferences = () => {
    onAccept(settings);
  };

  const cookieOptions = [
    {
      type: 'necessary',
      label: 'Necessary Cookies',
      description: 'These cookies are essential for the website to function properly.',
      disabled: true
    },
    {
      type: 'preferences',
      label: 'Preferences',
      description: 'These cookies remember your preferences to enhance your experience.',
      disabled: false
    },
    {
      type: 'statistics',
      label: 'Statistics',
      description: 'Help us improve by letting us know how you use our site.',
      disabled: false
    },
    {
      type: 'marketing',
      label: 'Marketing',
      description: 'These cookies help us show you relevant ads on other sites.',
      disabled: false
    }
  ];

  return (
    <div className="cookie-modal-overlay">
      <div className="cookie-modal">
        <div className="cookie-modal-tabs">
          <button
            className={`cookie-tab ${activeTab === 'consent' ? 'active' : ''}`}
            onClick={() => setActiveTab('consent')}
          >
            Consent
          </button>
          <button
            className={`cookie-tab ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
        </div>

        <div className="cookie-modal-body">
          {activeTab === 'consent' ? (
            <div className="space-y-4">
              {cookieOptions.map(({ type, label, description, disabled }) => (
                <div key={type} className="cookie-option">
                  <div className="cookie-option-content">
                    <h3>{label}</h3>
                    <p>{description}</p>
                  </div>
                  <ToggleSwitch
                    isChecked={settings[type]}
                    onChange={() => handleToggle(type)}
                    disabled={disabled}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="cookie-details">
              <h3>About Our Cookies</h3>
              <p>
                We use cookies to improve your browsing experience and analyze our traffic. 
                You can choose which types of cookies you want to allow.
              </p>
              
              <div className="cookie-details-section">
                <h4>Necessary Cookies</h4>
                <p>Required for basic site functionality. These cookies are essential and cannot be disabled.</p>
              </div>
              
              <div className="cookie-details-section">
                <h4>Preference Cookies</h4>
                <p>These cookies allow us to remember your settings and preferences.</p>
              </div>
              
              <div className="cookie-details-section">
                <h4>Statistics Cookies</h4>
                <p>Help us understand how visitors interact with our website.</p>
              </div>
              
              <div className="cookie-details-section">
                <h4>Marketing Cookies</h4>
                <p>Used to deliver relevant advertisements and track campaign performance.</p>
              </div>
            </div>
          )}
        </div>

        <div className="cookie-modal-footer">
          <button
            onClick={handleRejectAll}
            className="cookie-button cookie-button-secondary"
          >
            Reject All
          </button>
          <button
            onClick={handleSavePreferences}
            className="cookie-button cookie-button-secondary"
          >
            Save Preferences
          </button>
          <button
            onClick={handleAcceptAll}
            className="cookie-button cookie-button-primary"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
import React, { createContext, useContext, useState, useEffect } from 'react';

const PrivacyContext = createContext();

export const PrivacyProvider = ({ children }) => {
  const [privacySettings, setPrivacySettings] = useState({
    marketingConsent: false,
    analyticsConsent: false,
    necessary: true,
    preferences: false
  });

  useEffect(() => {
    // Load saved cookie consent settings
    const savedConsent = localStorage.getItem('cookieConsent');
    if (savedConsent) {
      const parsedConsent = JSON.parse(savedConsent);
      setPrivacySettings(prev => ({
        ...prev,
        marketingConsent: parsedConsent.marketing || false,
        analyticsConsent: parsedConsent.statistics || false,
        preferences: parsedConsent.preferences || false,
        necessary: true
      }));
    }
  }, []);

  const updatePrivacySettings = (newSettings) => {
    setPrivacySettings(newSettings);
    // Update cookie consent when privacy settings change
    localStorage.setItem('cookieConsent', JSON.stringify({
      necessary: true,
      marketing: newSettings.marketingConsent,
      statistics: newSettings.analyticsConsent,
      preferences: newSettings.preferences,
      timestamp: new Date().toISOString()
    }));
  };

  return (
    <PrivacyContext.Provider value={{ privacySettings, updatePrivacySettings }}>
      {children}
    </PrivacyContext.Provider>
  );
};

export const usePrivacy = () => useContext(PrivacyContext);

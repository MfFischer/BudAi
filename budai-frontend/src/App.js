import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/Home";
import Chat from "./components/Chat";
import Activities from "./components/Activities";
import Profile from "./components/Profile";
import Login from "./components/Login";
import Navbar from "./components/Navbar";
import CookieConsent from './components/CookieConsent';
import CookieSettings from './components/CookieSettings';
import PrivacyPolicy from './components/PrivacyPolicy';
import PrivacyCenter from './components/PrivacyCenter';
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { PrivacyProvider, usePrivacy } from "./contexts/PrivacyContext";
import "./App.css";

// Loading Component
const LoadingScreen = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-[#151235] bg-opacity-90">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
  </div>
);

// API Error Modal Component
const ApiLimitModal = ({ isOpen, resetTime }) => {
  if (!isOpen) return null;

  const resetDateTime = new Date(resetTime);
  const formattedTime = resetDateTime.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-semibold mb-4">Free Messaging Limit Reached</h3>
        <p className="mb-4">
          You've reached the daily limit for free messages. The service will reset at {formattedTime}.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
};

// Private route wrapper with consent check
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const { privacySettings } = usePrivacy();
  
  // Only show loading screen if auth is still loading
  if (loading) return <LoadingScreen />;
  
  // Redirect to login if not authenticated
  if (!user) return <Navigate to="/login" />;
  
  // If authenticated, render the children components
  return children;
};

function AppContent() {
  const { privacySettings, updatePrivacySettings } = usePrivacy();
  const { user } = useAuth();
  
  // State for UI management
  const [showCookieSettings, setShowCookieSettings] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiLimitReached, setApiLimitReached] = useState(false);
  const [apiResetTime, setApiResetTime] = useState(null);
  
  // Determine if we need to show the consent banner
  // Only show if necessary cookies are not accepted AND user is logged in
  const showCookieConsent = user && !privacySettings.necessary;

  useEffect(() => {
    // No additional loading needed since PrivacyContext handles initial loading
    setLoading(false);
  }, []);

  // Handle API limit events
  const handleApiLimit = (resetTime) => {
    setApiLimitReached(true);
    setApiResetTime(resetTime);
  };

  // Cookie consent handlers
  const handleAcceptAll = () => {
    updatePrivacySettings({
      ...privacySettings,
      necessary: true,
      preferences: true,
      marketingConsent: true,
      analyticsConsent: true
    });
    setShowCookieSettings(false);
  };

  const handleSavePreferences = (preferences) => {
    updatePrivacySettings({
      ...preferences,
      necessary: true // Necessary cookies are always required
    });
    setShowCookieSettings(false);
  };

  const handleRejectAll = () => {
    updatePrivacySettings({
      ...privacySettings,
      necessary: true, // Necessary cookies are always required
      preferences: false,
      marketingConsent: false,
      analyticsConsent: false
    });
    setShowCookieSettings(false);
  };

  const handleShowSettings = () => {
    setShowCookieSettings(true);
  };

  const handleCloseSettings = () => {
    setShowCookieSettings(false);
  };

  if (loading) return <LoadingScreen />;

  return (
    <Router>
      <div className="App relative min-h-screen bg-gradient-to-br from-[#5f1e72] to-[#023b86]">
        <div className={`flex flex-col min-h-screen ${showCookieConsent ? 'pb-32' : ''}`}>
          <Navbar onShowCookieSettings={handleShowSettings} />
          
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/privacy-center" element={<PrivacyCenter />} />
              
              {/* Protected Routes */}
              <Route 
                path="/chat" 
                element={
                  <PrivateRoute>
                    <Chat onApiLimit={handleApiLimit} />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/activities" 
                element={
                  <PrivateRoute>
                    <Activities onApiLimit={handleApiLimit} />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/privacy-settings" 
                element={
                  <PrivateRoute>
                    <PrivacyCenter />
                  </PrivateRoute>
                } 
              />
            </Routes>
          </main>

          {/* Cookie Consent Banner - only show if necessary cookies not accepted */}
          {showCookieConsent && (
            <CookieConsent 
              onAccept={handleAcceptAll}
              onShowSettings={handleShowSettings}
              onReject={handleRejectAll}
            />
          )}

          {/* Cookie Settings Modal */}
          {showCookieSettings && (
            <CookieSettings 
              preferences={privacySettings}
              onClose={handleCloseSettings}
              onSave={handleSavePreferences}
              onAcceptAll={handleAcceptAll}
              onRejectAll={handleRejectAll}
            />
          )}

          {/* API Limit Modal */}
          <ApiLimitModal 
            isOpen={apiLimitReached} 
            resetTime={apiResetTime}
          />
        </div>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <PrivacyProvider>
        <AppContent />
      </PrivacyProvider>
    </AuthProvider>
  );
}

export default App;
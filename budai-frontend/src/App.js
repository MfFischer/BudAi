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
import { PrivacyProvider } from "./contexts/PrivacyContext";
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

// Private route wrapper
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? children : <Navigate to="/login" />;
};

function App() {
  // State for managing cookie preferences and UI
  const [cookiePreferences, setCookiePreferences] = useState({
    necessary: true,
    preferences: false,
    statistics: false,
    marketing: false
  });
  const [showCookieConsent, setShowCookieConsent] = useState(true);
  const [showCookieSettings, setShowCookieSettings] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiLimitReached, setApiLimitReached] = useState(false);
  const [apiResetTime, setApiResetTime] = useState(null);

  // Load saved cookie preferences on mount
  useEffect(() => {
    try {
      const savedConsent = localStorage.getItem('cookieConsent');
      if (savedConsent) {
        const parsedConsent = JSON.parse(savedConsent);
        setCookiePreferences(prev => ({
          ...prev,
          ...parsedConsent
        }));
        setShowCookieConsent(false);
      }
    } catch (error) {
      console.error('Error loading cookie preferences:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle API limit events
  const handleApiLimit = (resetTime) => {
    setApiLimitReached(true);
    setApiResetTime(resetTime);
  };

  // Cookie consent handlers
  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      preferences: true,
      statistics: true,
      marketing: true,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('cookieConsent', JSON.stringify(allAccepted));
    setCookiePreferences(allAccepted);
    setShowCookieConsent(false);
    setShowCookieSettings(false);
  };

  const handleSavePreferences = (preferences) => {
    const updatedPreferences = {
      ...preferences,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('cookieConsent', JSON.stringify(updatedPreferences));
    setCookiePreferences(updatedPreferences);
    setShowCookieConsent(false);
    setShowCookieSettings(false);
  };

  const handleRejectAll = () => {
    const minimal = {
      necessary: true,
      preferences: false,
      statistics: false,
      marketing: false,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('cookieConsent', JSON.stringify(minimal));
    setCookiePreferences(minimal);
    setShowCookieConsent(false);
    setShowCookieSettings(false);
  };

  const handleShowSettings = () => {
    setShowCookieSettings(true);
    setShowCookieConsent(false);
  };

  const handleCloseSettings = () => {
    setShowCookieSettings(false);
    if (!localStorage.getItem('cookieConsent')) {
      setShowCookieConsent(true);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <AuthProvider>
      <PrivacyProvider>
        <Router>
          <div className="App relative min-h-screen bg-gradient-to-br from-[#5f1e72] to-[#023b86]">
            <div className={`flex flex-col min-h-screen ${showCookieConsent ? 'pb-32' : ''}`}>
              <Navbar onShowCookieSettings={handleShowSettings} />
              
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  
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

              {/* Cookie Consent Banner */}
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
                  preferences={cookiePreferences}
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
      </PrivacyProvider>
    </AuthProvider>
  );
}

export default App;
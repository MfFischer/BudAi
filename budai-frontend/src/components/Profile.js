import React, { useState, useEffect } from "react";
import axios from "axios";
import { auth } from "../firebase/config";
import { motion, AnimatePresence } from "framer-motion";
import { usePrivacy } from '../contexts/PrivacyContext';

// Animation variants
const tabVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const Profile = () => {
  const { privacySettings, updatePrivacySettings } = usePrivacy();

  // State management
  const [activeTab, setActiveTab] = useState("personal-info");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [language, setLanguage] = useState("English");
  const [avatar, setAvatar] = useState(null);
  const [conversationStyle, setConversationStyle] = useState("empathetic");
  const [notificationPreference, setNotificationPreference] = useState("daily");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState("");
  
  // Privacy-related states
  const [dataRetentionPeriod, setDataRetentionPeriod] = useState(
    privacySettings.dataRetentionPeriod || "30days"
  );
  const [marketingConsent, setMarketingConsent] = useState(
    privacySettings.marketingConsent || false
  );
  const [analyticsConsent, setAnalyticsConsent] = useState(
    privacySettings.analyticsConsent || false
  );

  const getInitials = (name) => {
    return name
      ? name.split(' ').map(word => word[0]).join('').toUpperCase()
      : "?";
  };

  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          if (width > height && width > 500) {
            height = Math.round((height * 500) / width);
            width = 500;
          } else if (height > 500) {
            width = Math.round((width * 500) / height);
            height = 500;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          const compressedImage = canvas.toDataURL('image/jpeg', 0.7);
          setAvatar(compressedImage);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setError("Please log in to view your profile");
        return;
      }

      const token = await currentUser.getIdToken();
      const response = await axios.get("http://localhost:5000/api/profile", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        const profileData = response.data.data;
        setName(profileData.name || "");
        setAge(profileData.age || "");
        setLanguage(profileData.language || "English");
        setConversationStyle(profileData.conversationStyle || "empathetic");
        setNotificationPreference(profileData.notificationPreference || "daily");
        if (profileData.avatar) setAvatar(profileData.avatar);
        
        // Update privacy settings
        setMarketingConsent(profileData.marketingConsent || false);
        setAnalyticsConsent(profileData.analyticsConsent || false);
        setDataRetentionPeriod(profileData.dataRetentionPeriod || "30days");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setError("Please log in to save changes");
        return;
      }

      setSaveStatus("Saving...");
      const token = await currentUser.getIdToken();
      
      const updatedPrivacySettings = {
        marketingConsent,
        analyticsConsent,
        dataRetentionPeriod
      };

      const response = await axios.put(
        "http://localhost:5000/api/profile",
        {
          name,
          age,
          language,
          avatar,
          conversationStyle,
          notificationPreference,
          ...updatedPrivacySettings
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        updatePrivacySettings(updatedPrivacySettings);
        setSaveStatus("Changes saved successfully!");
        setTimeout(() => setSaveStatus(""), 3000);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      setSaveStatus("Failed to save changes. Please try again.");
    }
  };

  const handleDataDeletion = async () => {
    if (!window.confirm("Are you sure you want to delete all your data? This action cannot be undone.")) {
      return;
    }

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      await axios.delete("http://localhost:5000/api/profile/data", {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      alert("Your data has been successfully deleted.");
      window.location.href = "/logout";
    } catch (error) {
      console.error("Error deleting data:", error);
      alert("Failed to delete data. Please try again.");
    }
  };

  const handleDataExport = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const response = await axios.get("http://localhost:5000/api/profile/export", {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'my-data.json');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Failed to export data. Please try again.");
    }
  };

  const renderPrivacyTab = () => (
    <motion.div
      variants={tabVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="profile-content"
    >
      <h2 className="text-2xl font-bold mb-6 text-white">Privacy Settings</h2>
      
      <div className="space-y-6">
        <div className="profile-form-group">
          <label className="profile-label">Data Retention Period</label>
          <select
            value={dataRetentionPeriod}
            onChange={(e) => setDataRetentionPeriod(e.target.value)}
            className="profile-select"
          >
            <option value="30days">30 Days</option>
            <option value="90days">90 Days</option>
            <option value="1year">1 Year</option>
          </select>
        </div>

        <div className="profile-form-group">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={marketingConsent}
              onChange={(e) => setMarketingConsent(e.target.checked)}
              className="form-checkbox"
            />
            <span className="text-white">Receive marketing communications</span>
          </label>
        </div>

        <div className="profile-form-group">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={analyticsConsent}
              onChange={(e) => setAnalyticsConsent(e.target.checked)}
              className="form-checkbox"
            />
            <span className="text-white">Allow usage analytics</span>
          </label>
        </div>

        <div className="space-y-4 mt-8">
          <button
            onClick={handleDataExport}
            className="w-full p-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Export My Data
          </button>
          <button
            onClick={handleDataDeletion}
            className="w-full p-3 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Delete My Data
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderPreferencesTab = () => (
    <motion.div
      variants={tabVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="profile-content"
    >
      <h2 className="text-2xl font-bold mb-6 text-white">Preferences</h2>
      <div className="profile-form-group">
        <label className="profile-label">Conversation Style</label>
        <select
          value={conversationStyle}
          onChange={(e) => setConversationStyle(e.target.value)}
          className="profile-select"
        >
          <option value="empathetic">Empathetic</option>
          <option value="direct">Direct</option>
          <option value="professional">Professional</option>
          <option value="friendly">Friendly</option>
          <option value="casual">Casual</option>
        </select>
      </div>
      <div className="profile-form-group">
        <label className="profile-label">Notifications</label>
        <select
          value={notificationPreference}
          onChange={(e) => setNotificationPreference(e.target.value)}
          className="profile-select"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="none">None</option>
        </select>
      </div>
    </motion.div>
  );

  const renderPersonalInfoTab = () => (
    <motion.div
      variants={tabVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="profile-content"
    >
      <h2 className="text-2xl font-bold mb-6 text-white">Personal Information</h2>
      <div className="profile-form-group">
        <label className="profile-label">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="profile-input"
          placeholder="Enter your name"
        />
      </div>
      <div className="profile-form-group">
        <label className="profile-label">Age</label>
        <input
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className="profile-input"
          placeholder="Enter your age"
        />
      </div>
      <div className="profile-form-group">
        <label className="profile-label">Language</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="profile-select"
        >
          {["English", "Español", "Français", "Deutsch", "Italiano", "Português",
            "日本語", "한국어", "中文", "Русский", "العربية", "हिन्दी"].map((lang) => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
      </div>
    </motion.div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "personal-info":
        return renderPersonalInfoTab();
      case "preferences":
        return renderPreferencesTab();
      case "privacy":
        return renderPrivacyTab();
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="profile-page flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page flex items-center justify-center">
        <div className="profile-status error">{error}</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="flex items-center">
            <div className="profile-avatar-container">
              <input
                type="file"
                id="avatar-upload"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarUpload}
              />
              <label htmlFor="avatar-upload" className="cursor-pointer">
                {avatar ? (
                  <img src={avatar} alt="Profile" className="profile-avatar" />
                ) : (
                  <div className="profile-avatar flex items-center justify-center">
                    {getInitials(name)}
                  </div>
                )}
                <div className="profile-edit-icon">✎</div>
              </label>
            </div>
            <div className="ml-6">
              <h1 className="text-2xl font-bold text-white">{name || "Welcome!"}</h1>
              <p className="text-gray-300">Manage your profile and preferences</p>
            </div>
          </div>
        </div>

        <div className="profile-tabs">
          {["Personal Info", "Preferences", "Privacy"].map((tab) => (
            <button
              key={tab}
              className={`profile-tab ${activeTab === tab.toLowerCase().replace(" ", "-") ? "active" : ""}`}
              onClick={() => setActiveTab(tab.toLowerCase().replace(" ", "-"))}
            >
              {tab}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          {renderTabContent()}
        </AnimatePresence>

        {saveStatus && (
          <div 
            className={`profile-status mt-4 p-4 rounded-lg text-center ${
              saveStatus.includes("Failed") ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"
            }`}
          >
            {saveStatus}
          </div>
        )}

        <motion.button 
          className="profile-save-btn w-full mt-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 px-6 rounded-lg hover:opacity-90 transition-opacity"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
        >
          Save Changes
        </motion.button>
      </div>
    </div>
  );
};

export default Profile;
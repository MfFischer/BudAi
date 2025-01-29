import React, { useState, useEffect } from "react";
import axios from "axios";
import { auth } from "../firebase/config";
import { motion, AnimatePresence } from "framer-motion";

const languageOptions = [
  "English", "Español", "Français", "Deutsch", "Italiano", "Português",
  "日本語", "한국어", "中文", "Русский", "العربية", "हिन्दी",
  "Bahasa Indonesia", "Tiếng Việt", "ไทย"
];

const Profile = () => {
  // States remain the same
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

  // Animation variants
  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3 }
    }
  };

  // Existing functions remain the same
  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          // Calculate new dimensions (max 500px width/height)
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
          
          // Convert to base64 with reduced quality
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

      const profileData = response.data;
      setName(profileData.name || "");
      setAge(profileData.age || "");
      setLanguage(profileData.language || "English");
      setConversationStyle(profileData.conversationStyle || "empathetic");
      setNotificationPreference(profileData.notificationPreference || "daily");
      if (profileData.avatar) setAvatar(profileData.avatar);
      
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
      
      await axios.put(
        "http://localhost:5000/api/profile",
        {
          name,
          age,
          language,
          avatar,
          conversationStyle,
          notificationPreference
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setSaveStatus("Changes saved successfully!");
      setTimeout(() => setSaveStatus(""), 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
      setSaveStatus("Failed to save changes. Please try again.");
    }
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : "?";
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

  const renderTabContent = () => {
    switch (activeTab) {
      case "personal-info":
        return (
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
                {languageOptions.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          </motion.div>
        );

      case "preferences":
        return (
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

      // Other cases remain similar but with updated styling classes
      case "mood-insights":
        return (
          <motion.div
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="profile-content"
          >
            <h2 className="text-2xl font-bold mb-6 text-white">Mood Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-opacity-20 bg-white backdrop-blur-lg rounded-xl p-6">
                <h4 className="text-white font-medium">Weekly Average</h4>
                <p className="text-2xl font-bold text-[#FF6F61]">Positive</p>
              </div>
              <div className="bg-opacity-20 bg-white backdrop-blur-lg rounded-xl p-6">
                <h4 className="text-white font-medium">Monthly Progress</h4>
                <p className="text-2xl font-bold text-[#FF6F61]">↑ 15%</p>
              </div>
              <div className="bg-opacity-20 bg-white backdrop-blur-lg rounded-xl p-6">
                <h4 className="text-white font-medium">Consistency</h4>
                <p className="text-2xl font-bold text-[#FF6F61]">High</p>
              </div>
            </div>
          </motion.div>
        );

      // Add other cases with similar styling updates...
      default:
        return null;
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Profile Header */}
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

        {/* Navigation Tabs */}
        <div className="profile-tabs">
          {["Personal Info", "Preferences", "Mood Insights", "Achievements", "Activity Log", "Security"].map((tab) => (
            <button
              key={tab}
              className={`profile-tab ${activeTab === tab.toLowerCase().replace(" ", "-") ? "active" : ""}`}
              onClick={() => setActiveTab(tab.toLowerCase().replace(" ", "-"))}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {renderTabContent()}
        </AnimatePresence>

        {/* Save Status */}
        {saveStatus && (
          <div className={`profile-status ${saveStatus.includes("Failed") ? "error" : "success"}`}>
            {saveStatus}
          </div>
        )}

        {/* Save Button */}
        <button className="profile-save-btn" onClick={handleSave}>
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default Profile;
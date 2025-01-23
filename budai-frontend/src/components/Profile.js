// src/components/Profile.js
import React, { useState } from "react";
import { motion } from "framer-motion";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("personal-info");
  const [name, setName] = useState("John Doe");
  const [age, setAge] = useState(25);
  const [language, setLanguage] = useState("English");
  const [conversationStyle, setConversationStyle] = useState("empathetic");
  const [notificationPreference, setNotificationPreference] = useState("daily");

  const handleSave = () => {
    alert("Profile saved successfully!");
  };

  return (
    <motion.div
      className="profile-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Hero Section */}
      <div className="hero-section">
        <div className="profile-picture">
          <img src="/images/user-avatar.png" alt="Profile" />
          <div className="edit-icon">✎</div>
        </div>
        <div className="user-info">
          <h1>{name}</h1>
          <p>Feeling optimistic today!</p>
        </div>
        <div className="quick-stats">
          <div className="stat">
            <h3>15</h3>
            <p>Days Active</p>
          </div>
          <div className="stat">
            <h3>Mostly Happy</h3>
            <p>Mood Trend</p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="tabs">
        <button
          className={activeTab === "personal-info" ? "active" : ""}
          onClick={() => setActiveTab("personal-info")}
        >
          Personal Info
        </button>
        <button
          className={activeTab === "preferences" ? "active" : ""}
          onClick={() => setActiveTab("preferences")}
        >
          Preferences
        </button>
        <button
          className={activeTab === "mood-insights" ? "active" : ""}
          onClick={() => setActiveTab("mood-insights")}
        >
          Mood Insights
        </button>
        <button
          className={activeTab === "achievements" ? "active" : ""}
          onClick={() => setActiveTab("achievements")}
        >
          Achievements
        </button>
        <button
          className={activeTab === "activity-log" ? "active" : ""}
          onClick={() => setActiveTab("activity-log")}
        >
          Activity Log
        </button>
        <button
          className={activeTab === "security" ? "active" : ""}
          onClick={() => setActiveTab("security")}
        >
          Security
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "personal-info" && (
          <div className="personal-info">
            <h2>Personal Info</h2>
            <form>
              <label>
                Name:
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <label>
                Age:
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </label>
              <label>
                Language:
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="English">English</option>
                  <option value="Tagalog">Tagalog</option>
                  <option value="Cebuano">Cebuano</option>
                </select>
              </label>
              <label>
                <input type="checkbox" /> Share less detailed data with AI
              </label>
            </form>
          </div>
        )}

        {activeTab === "preferences" && (
          <div className="preferences">
            <h2>Preferences</h2>
            <form>
              <label>
                Conversation Style:
                <select
                  value={conversationStyle}
                  onChange={(e) => setConversationStyle(e.target.value)}
                >
                  <option value="empathetic">Empathetic</option>
                  <option value="motivational">Motivational</option>
                  <option value="humorous">Humorous</option>
                </select>
              </label>
              <label>
                Activity Recommendations:
                <input type="checkbox" /> Focus on mindfulness activities
              </label>
              <label>
                Notification Preferences:
                <select
                  value={notificationPreference}
                  onChange={(e) => setNotificationPreference(e.target.value)}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="none">None</option>
                </select>
              </label>
            </form>
          </div>
        )}

        {activeTab === "mood-insights" && (
          <div className="mood-insights">
            <h2>Mood Insights</h2>
            <div className="mood-graph">
              <p>Your mood over the past week:</p>
              <div className="graph-placeholder">
                {/* Placeholder for a mood graph */}
                <p>Graph will be displayed here.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "achievements" && (
          <div className="achievements">
            <h2>Achievements</h2>
            <div className="badges">
              <div className="badge">
                <p>Completed 5 activities in a row</p>
              </div>
              <div className="badge">
                <p>Journaled for 7 consecutive days</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "activity-log" && (
          <div className="activity-log">
            <h2>Activity Log</h2>
            <ul>
              <li>Jan 15: Felt motivated after journaling</li>
              <li>Jan 14: Completed a mindfulness activity</li>
              <li>Jan 13: Started a new goal</li>
            </ul>
          </div>
        )}

        {activeTab === "security" && (
          <div className="security">
            <h2>Security</h2>
            <form>
              <label>
                Change Password:
                <input type="password" placeholder="New Password" />
              </label>
              <label>
                Enable 2FA:
                <input type="checkbox" />
              </label>
            </form>
          </div>
        )}
      </div>

      {/* Call-to-Actions */}
      <div className="cta-buttons">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleSave}
        >
          Save Changes
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => alert("Syncing data...")}
        >
          Sync Data
        </motion.button>
      </div>

      {/* Help and Support */}
      <div className="help-support">
        <a href="#">Need help? Visit our support page.</a>
      </div>
    </motion.div>
  );
};

export default Profile;
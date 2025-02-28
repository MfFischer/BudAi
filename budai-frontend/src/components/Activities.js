import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { auth } from "../firebase/config";
import { usePrivacy } from '../contexts/PrivacyContext';
import "./Activities.css";

const Activities = ({ onApiLimit }) => {
  const { privacySettings } = usePrivacy();
  
  const [journalEntry, setJournalEntry] = useState("");
  const [journalResponse, setJournalResponse] = useState("");
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // The API endpoint base - use environment variable or default
  const API_BASE = process.env.REACT_APP_API_URL || window.location.hostname === 'localhost' 
    ? 'http://localhost:5001' 
    : '';

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setError("Please log in to view activities");
          setLoading(false);
          return;
        }
    
        const token = await user.getIdToken();
        const response = await axios.get(
          `${API_BASE}/api/activities/suggestions/${user.uid}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
    
        if (response.data.success) {
          setSuggestions(response.data.data);
        } else {
          throw new Error(response.data.error || 'Failed to load suggestions');
        }
      } catch (error) {
        console.error("Error details:", error.response || error);
        
        // Handle API limit
        if (error.response?.status === 429) {
          const resetTime = error.response.data.resetTime;
          onApiLimit && onApiLimit(resetTime);
          setError("Free messaging limit reached. Service will reset at midnight Pacific Time.");
        } else {
          // If API fails, set default suggestions
          setSuggestions({
            dailySuggestions: [
              {
                title: "Take a Mindful Break",
                description: "Practice deep breathing for a few minutes"
              },
              {
                title: "Connect with Nature",
                description: "Take a short walk outside"
              },
              {
                title: "Express Yourself",
                description: "Write down your thoughts and feelings"
              }
            ],
            motivationalQuote: "Every moment is a fresh beginning.",
            quoteTheme: "new beginnings",
            mindfulnessActivities: [
              {
                title: "Simple Breathing Exercise",
                description: "A calming breathing technique",
                duration: "5 minutes",
                benefits: "Reduces stress and anxiety, improves focus",
                instructions: [
                  "Find a comfortable seated position",
                  "Close your eyes gently",
                  "Breathe in slowly for 4 counts",
                  "Hold for 4 counts",
                  "Exhale slowly for 4 counts",
                  "Repeat for 5 minutes"
                ],
                guidance: "If your mind wanders, gently bring your attention back to your breath"
              }
            ],
            journalingPrompt: "What's one small thing you're grateful for today?"
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [API_BASE, onApiLimit]);

  const handleJournalSubmit = async () => {
    if (!journalEntry.trim()) return;

    try {
      setLoading(true);
      const user = auth.currentUser;
      const token = await user.getIdToken();
      
      const response = await axios.post(
        `${API_BASE}/api/activities/journal/${user.uid}`,
        { entry: journalEntry },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setJournalResponse("Thank you for sharing! Your thoughts matter.");
        setJournalEntry("");
      }
      
    } catch (error) {
      console.error("Error submitting journal:", error);
      if (error.response?.status === 429) {
        const resetTime = error.response.data.resetTime;
        onApiLimit && onApiLimit(resetTime);
        setError("Free messaging limit reached. Service will reset at midnight Pacific Time.");
      } else {
        setError("Failed to submit journal entry. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="activities-container">
        <motion.div 
          className="loading flex items-center justify-center h-32"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      className="activities-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {error ? (
        <motion.div 
          className="error-message"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p>{error}</p>
        </motion.div>
      ) : (
        <div className="activities-content">
          <motion.h1 
            initial={{ y: -20 }}
            animate={{ y: 0 }}
          >
            Activities
          </motion.h1>
          
          {/* Daily Manifestation Quote Section */}
          {suggestions?.motivationalQuote && (
            <motion.div 
              className="quote-card"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <p className="quote">{suggestions.motivationalQuote}</p>
              <p className="quote-theme">Theme: {suggestions.quoteTheme}</p>
            </motion.div>
          )}

          {/* Daily Suggestions Section */}
          {suggestions?.dailySuggestions && (
            <section className="daily-suggestions mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-white">Daily Suggestions</h2>
              <div className="activity-grid">
                {suggestions.dailySuggestions.map((activity, index) => (
                  <motion.div
                    key={index}
                    className="activity-card"
                    whileHover={{ scale: 1.02 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <h3>{activity.title}</h3>
                    <p>{activity.description}</p>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Mindfulness Activities Section */}
          {suggestions?.mindfulnessActivities && (
            <section className="mindfulness-section mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-white">Mindfulness Activities</h2>
              <div className="activity-grid">
                {suggestions.mindfulnessActivities.map((activity, index) => (
                  <motion.div
                    key={index}
                    className="activity-card mindfulness-card"
                    whileHover={{ scale: 1.02 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                  >
                    <h3>{activity.title}</h3>
                    <p className="activity-description">{activity.description}</p>
                    {activity.duration && (
                      <div className="activity-details">
                        <div className="activity-duration">
                          <span className="label">Duration:</span> {activity.duration}
                        </div>
                        {activity.benefits && (
                          <div className="activity-benefits">
                            <span className="label">Benefits:</span> {activity.benefits}
                          </div>
                        )}
                      </div>
                    )}
                    {activity.instructions && (
                      <div className="activity-instructions">
                        <h4>Instructions:</h4>
                        <ol>
                          {activity.instructions.map((step, i) => (
                            <motion.li 
                              key={i}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 + 0.5 }}
                            >
                              {step}
                            </motion.li>
                          ))}
                        </ol>
                      </div>
                    )}
                    {activity.guidance && (
                      <div className="activity-guidance">
                        <p><em>{activity.guidance}</em></p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Journaling Tool */}
          <section className="journaling-tool">
            <h2 className="text-2xl font-semibold mb-4 text-white">Journaling Tool</h2>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
              <p className="text-lg text-gray-300 mb-4 journaling-prompt">
                {suggestions?.journalingPrompt || "What's on your mind today?"}
              </p>
              <textarea
                value={journalEntry}
                onChange={(e) => setJournalEntry(e.target.value)}
                placeholder="Write your thoughts here..."
                className="w-full h-32 bg-white/10 rounded-lg p-4 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#FF6F61]"
                disabled={loading}
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleJournalSubmit}
                disabled={loading || !journalEntry.trim()}
                className="w-full bg-gradient-to-r from-[#FF6F61] to-[#FF8F61] text-white rounded-lg py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {loading ? 'Saving...' : 'Save Entry'}
              </motion.button>
              {journalResponse && (
                <motion.div 
                  className="mt-4 text-center text-gray-300 journal-response"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {journalResponse}
                </motion.div>
              )}
            </div>
          </section>
        </div>
      )}
    </motion.div>
  );
};

export default Activities;
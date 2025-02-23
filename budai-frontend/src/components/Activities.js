import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { auth } from "../firebase/config";
import { usePrivacy } from '../contexts/PrivacyContext';

const Activities = ({ onApiLimit }) => {
  const { privacySettings } = usePrivacy();
  
  const [journalEntry, setJournalEntry] = useState("");
  const [journalResponse, setJournalResponse] = useState("");
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          `http://localhost:5000/api/activities/suggestions/${user.uid}`,
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
          onApiLimit(resetTime);
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
  }, [onApiLimit]);

  const handleJournalSubmit = async () => {
    if (!journalEntry.trim()) return;

    try {
      setLoading(true);
      const user = auth.currentUser;
      const token = await user.getIdToken();
      
      const response = await axios.post(
        `http://localhost:5000/api/activities/journal/${user.uid}`,
        { entry: journalEntry },
        {
          headers: {
            'Authorization': `Bearer ${token}`
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
        onApiLimit(resetTime);
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
          className="error-message bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-red-400">{error}</p>
        </motion.div>
      ) : (
        <div className="mb-8">
          <motion.h1 
            className="text-3xl font-bold mb-4 bg-gradient-to-r from-[#FF6F61] to-[#FF8F61] bg-clip-text text-transparent"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
          >
            Activities
          </motion.h1>
          
          {suggestions?.motivationalQuote && (
            <motion.div 
              className="quote-section bg-white/5 backdrop-blur-sm rounded-xl p-6 mb-8"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-xl text-white mb-2">{suggestions.motivationalQuote}</p>
              <p className="text-sm text-gray-400">Theme: {suggestions.quoteTheme}</p>
            </motion.div>
          )}

          {/* Daily Suggestions Section */}
          {suggestions?.dailySuggestions && (
            <section className="daily-suggestions mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-white">Daily Suggestions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suggestions.dailySuggestions.map((activity, index) => (
                  <motion.div
                    key={index}
                    className="activity-card bg-white/5 backdrop-blur-sm rounded-xl p-6 hover:bg-white/10 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <h3 className="text-lg font-semibold mb-2 text-white">{activity.title}</h3>
                    <p className="text-gray-300">{activity.description}</p>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Journaling Tool */}
          <section className="journaling-tool">
            <h2 className="text-2xl font-semibold mb-4 text-white">Journaling Tool</h2>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
              <p className="text-lg text-gray-300 mb-4">
                {suggestions?.journalingPrompt || "What's on your mind today?"}
              </p>
              <textarea
                value={journalEntry}
                onChange={(e) => setJournalEntry(e.target.value)}
                placeholder="Write your thoughts here..."
                className="w-full h-32 bg-white/10 rounded-lg p-4 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#FF6F61] mb-4"
                disabled={loading}
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleJournalSubmit}
                disabled={loading || !journalEntry.trim()}
                className="w-full bg-gradient-to-r from-[#FF6F61] to-[#FF8F61] text-white rounded-lg py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Entry'}
              </motion.button>
              {journalResponse && (
                <motion.div 
                  className="mt-4 text-center text-gray-300"
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
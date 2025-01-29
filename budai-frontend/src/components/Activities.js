import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { auth } from "../firebase/config";
import "./Activities.css";

const Activities = () => {
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
        const response = await axios.get(`/api/activities/suggestions/${user.uid}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setSuggestions(response.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setError("Failed to load suggestions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  const handleJournalSubmit = async () => {
    if (!journalEntry.trim()) return;

    try {
      setLoading(true);
      // You can add API call here to process journal entry
      setJournalResponse("Thank you for sharing! Your thoughts matter.");
      setJournalEntry("");
    } catch (error) {
      console.error("Error submitting journal:", error);
      setError("Failed to submit journal entry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="activities-container">
        <motion.div 
          className="loading"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Loading suggestions...
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="activities-container">
        <motion.div 
          className="error-message"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p>{error}</p>
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
      <h1>Activities</h1>

      {/* Daily Suggestions */}
      <section className="daily-suggestions">
        <h2>Daily Suggestions</h2>
        <div className="activity-grid">
          {suggestions?.dailySuggestions?.map((activity, index) => (
            <motion.div
              key={index}
              className="activity-card"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <h3>{activity.title}</h3>
              <p>{activity.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Mindfulness Activities */}
      <section className="mindfulness-section">
        <h2>Mindfulness Activities</h2>
        <div className="activity-grid">
          {suggestions?.mindfulnessActivities?.map((activity, index) => (
            <motion.div
              key={index}
              className="activity-card mindfulness-card"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
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
                        transition={{ delay: i * 0.1 }}
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

      {/* Journaling Tool */}
      <section className="journaling-tool">
        <h2>Journaling Tool</h2>
        <p className="journaling-prompt">
          {suggestions?.journalingPrompt || "What's on your mind today?"}
        </p>
        <textarea
          placeholder="Write about your day..."
          value={journalEntry}
          onChange={(e) => setJournalEntry(e.target.value)}
          disabled={loading}
        />
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleJournalSubmit}
          disabled={loading || !journalEntry.trim()}
          className={`submit-button ${loading || !journalEntry.trim() ? 'disabled' : ''}`}
        >
          Submit
        </motion.button>
        {journalResponse && (
          <motion.div 
            className="journal-response"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p>{journalResponse}</p>
          </motion.div>
        )}
      </section>

      {/* Motivational Quote */}
      {suggestions?.motivationalQuote && (
        <section className="motivational-quotes">
          <h2>Daily Manifestation</h2>
          <div className="quote-carousel">
            <motion.div
              className="quote-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {suggestions.quoteDate && (
                <div className="quote-date">{suggestions.quoteDate}</div>
              )}
              <p className="quote">{suggestions.motivationalQuote}</p>
              {suggestions.quoteTheme && (
                <span className="quote-theme">Theme: {suggestions.quoteTheme}</span>
              )}
            </motion.div>
          </div>
        </section>
      )}
    </motion.div>
  );
};

export default Activities;
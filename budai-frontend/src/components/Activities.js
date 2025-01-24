import React, { useState } from "react";
import { motion } from "framer-motion";

const Activities = () => {
  const [journalEntry, setJournalEntry] = useState("");
  const [journalResponse, setJournalResponse] = useState("");

  const handleJournalSubmit = () => {
    if (journalEntry.trim() === "") return;

    // Simulate AI response
    setTimeout(() => {
      setJournalResponse("Thank you for sharing! Remember, every small step counts. Keep going!");
    }, 500);
  };

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
          <motion.div
            className="activity-card"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <h3>Take a 5-minute walk</h3>
            <p>Refresh your mind with a short walk outside.</p>
          </motion.div>
          <motion.div
            className="activity-card"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <h3>Watch a calming video</h3>
            <p>Relax with a soothing nature video.</p>
          </motion.div>
          <motion.div
            className="activity-card"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <h3>Write one thing you’re grateful for</h3>
            <p>Reflect on something positive in your life.</p>
          </motion.div>
        </div>
      </section>

      {/* Journaling Tool */}
      <section className="journaling-tool">
        <h2>Journaling Tool</h2>
        <textarea
          placeholder="Write about your day..."
          value={journalEntry}
          onChange={(e) => setJournalEntry(e.target.value)}
        />
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleJournalSubmit}
        >
          Submit
        </motion.button>
        {journalResponse && (
          <div className="journal-response">
            <p>{journalResponse}</p>
          </div>
        )}
      </section>

      {/* Games & Brain Exercises */}
      <section className="games-section">
        <h2>Games & Brain Exercises</h2>
        <div className="activity-grid">
          <motion.div
            className="activity-card"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <h3>Mindfulness Breathing</h3>
            <p>Follow a guided breathing exercise to relax.</p>
          </motion.div>
          <motion.div
            className="activity-card"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <h3>Puzzles</h3>
            <p>Solve a puzzle to sharpen your mind.</p>
          </motion.div>
          <motion.div
            className="activity-card"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <h3>Trivia Challenge</h3>
            <p>Test your knowledge with fun trivia questions.</p>
          </motion.div>
        </div>
      </section>

      {/* Mood Tracking Dashboard */}
      <section className="mood-tracking">
        <h2>Mood Tracking</h2>
        <div className="mood-graph">
          <p>Your mood over the past week:</p>
          <div className="graph-placeholder">
            {/* Placeholder for a mood graph */}
            <p>Graph will be displayed here.</p>
          </div>
        </div>
      </section>

      {/* Motivational Quotes */}
      <section className="motivational-quotes">
        <h2>Motivational Quotes</h2>
        <div className="quote-carousel">
          <p>"The best way to predict the future is to create it." – Peter Drucker</p>
        </div>
      </section>

      {/* Resources for Loneliness */}
      <section className="resources-section">
        <h2>Resources for Loneliness</h2>
        <div className="resources-list">
          <a href="#">Article: Overcoming Loneliness</a>
          <a href="#">Podcast: Building Social Connections</a>
          <a href="#">Video: Mindfulness for Mental Health</a>
        </div>
      </section>
    </motion.div>
  );
};

export default Activities;
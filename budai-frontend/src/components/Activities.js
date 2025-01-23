
import React from "react";
import { motion } from "framer-motion";

const Activities = () => {
  const activities = [
    { mood: "Happy", activity: "Go for a walk in nature." },
    { mood: "Sad", activity: "Write down your feelings in a journal." },
    { mood: "Stressed", activity: "Try a 5-minute meditation session." },
  ];

  return (
    <motion.div
      className="activities-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <h1>Mood-Based Activities</h1>
      <div className="activities-list">
        {activities.map((activity, index) => (
          <motion.div
            key={index}
            className="activity-card"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <h3>{activity.mood}</h3>
            <p>{activity.activity}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Activities;
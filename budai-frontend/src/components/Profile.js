
import React from "react";
import { motion } from "framer-motion";

const Profile = () => {
  return (
    <motion.div
      className="profile-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <h1>Profile</h1>
      <div className="profile-details">
        <p>Name: John Doe</p>
        <p>Email: john.doe@example.com</p>
        <p>Language Preference: English</p>
      </div>
    </motion.div>
  );
};

export default Profile;
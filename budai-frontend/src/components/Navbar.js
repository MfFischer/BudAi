// src/components/Navbar.js
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.nav
      className="navbar"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="navbar-brand">
        <img
          src="/images/budai-avatar.png" // Path to your logo
          alt="BudAi Logo"
          className="navbar-logo"
        />
        <h1>Budd</h1>
      </div>
      <div className={`navbar-links ${isOpen ? "active" : ""}`}>
        <Link to="/">Home</Link>
        <Link to="/chat">Chat</Link>
        <Link to="/activities">Activities</Link>
        <Link to="/profile">Profile</Link>
      </div>
      <button className="navbar-toggle" onClick={() => setIsOpen(!isOpen)}>
        ☰
      </button>
    </motion.nav>
  );
};

export default Navbar;
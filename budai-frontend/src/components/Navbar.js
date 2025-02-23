import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

const Navbar = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <motion.nav
      className={`navbar ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="navbar-brand">
        <img
          src="/images/budai-avatar.png"
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
        {!user ? (
          <Link to="/login" className="auth-link">Login</Link>
        ) : (
          <button 
            onClick={handleLogout}
            className="logout-button"
          >
            Logout
          </button>
        )}
      </div>
      <button 
        className="navbar-toggle" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation"
      >
        ☰
      </button>
    </motion.nav>
  );
};

export default Navbar;
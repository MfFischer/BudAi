// Home.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import axios from "axios";

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        try {
          const token = await user.getIdToken();
          const profileResponse = await axios.get("http://localhost:5000/api/profile", {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          const fullName = profileResponse.data.name || "";
          const firstName = fullName.split(" ")[0];
          setFirstName(firstName);
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStartChat = async () => {
    if (!user) {
      navigate("/login");
    } else {
      navigate("/chat");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <motion.div
        className="home-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="hero-section">
          <motion.div
            className="hero-content"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <motion.h1
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              {user ? `Hey ${firstName || 'Friend'}! Let's have a meaningful conversation.` : "Hello I'm Budd"}
            </motion.h1>
            {!user && (
              <motion.p
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              >
                Your emotionally intelligent AI companion.
              </motion.p>
            )}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleStartChat}
              className="primary-button"
            >
              {user ? "Continue Chat" : "Start Chatting"}
            </motion.button>
            <motion.img
              src="/images/budai-avatar.png"
              alt="BudAi Avatar"
              className="hero-avatar"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
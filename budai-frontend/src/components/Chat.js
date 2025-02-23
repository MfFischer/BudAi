import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { auth } from "../firebase/config";
import { usePrivacy } from '../contexts/PrivacyContext';
import { Link } from 'react-router-dom';

const Chat = ({ onApiLimit }) => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);
  const { privacySettings } = usePrivacy();

  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const response = await axios.get(
        `http://localhost:5000/api/chat/chat-history/${currentUser.uid}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setChatHistory(response.data.data.map(chat => ({
          sender: chat.sender,
          text: chat.message
        })));
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
      if (error.response?.status === 429) {
        const resetTime = error.response.data.resetTime;
        onApiLimit(resetTime);
      }
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    
    if (message.trim() === "" || isLoading) return;

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error("No user logged in");
        setChatHistory(prev => [...prev, { 
          sender: "system", 
          text: "Please log in to send messages." 
        }]);
        return;
      }

      setIsLoading(true);
      const token = await currentUser.getIdToken();
      
      // Add user message to chat immediately
      setChatHistory(prev => [...prev, { sender: "user", text: message }]);
      const sentMessage = message;
      setMessage("");

      const response = await axios.post(
        "http://localhost:5000/api/chat",
        { 
          message: sentMessage,
          uid: currentUser.uid,
          analyticsConsent: privacySettings.analyticsConsent,
          marketingConsent: privacySettings.marketingConsent
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setChatHistory(prev => [...prev, { 
          sender: "ai", 
          text: response.data.message 
        }]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      
      if (error.response?.status === 429) {
        const resetTime = error.response.data.resetTime;
        onApiLimit(resetTime);
        setChatHistory(prev => [...prev, { 
          sender: "system", 
          text: "Free messaging limit reached. Service will reset at midnight Pacific Time." 
        }]);
      } else {
        setChatHistory(prev => [...prev, { 
          sender: "system", 
          text: "Sorry, I'm having trouble responding right now. Please try again later." 
        }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // Show privacy notice if necessary cookies haven't been accepted
  if (!privacySettings.necessary) {
    return (
      <motion.div
        className="chat-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="bg-[#151235] p-8 rounded-lg shadow-lg text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-white">Cookie Settings Required</h2>
          <p className="mb-6 text-gray-300">
            To use our chat service, you need to accept necessary cookies. 
            Please visit our Privacy Center to manage your cookie preferences.
          </p>
          <Link
            to="/privacy-center"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Privacy Settings
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="chat-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="chat-history">
        {chatHistory.map((msg, index) => (
          <motion.div
            key={index}
            className={`message ${msg.sender}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="message-bubble">
              <p>{msg.text}</p>
            </div>
          </motion.div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="chat-input">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={isLoading ? "Sending..." : "Type a message..."}
          className="chat-input-field"
          disabled={isLoading}
        />
        <motion.button
          type="submit"
          className="chat-send-button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          disabled={isLoading}
        >
          Send
        </motion.button>
      </form>

      <div className="text-center mt-4">
        <Link
          to="/privacy-center"
          className="text-sm text-gray-400 hover:text-white"
        >
          Manage Privacy Settings
        </Link>
      </div>
    </motion.div>
  );
};

export default Chat;
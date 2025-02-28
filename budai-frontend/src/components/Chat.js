import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useChat } from "../hooks/useChat"; // <-- Named import
import { usePrivacy } from "../contexts/PrivacyContext";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

const Chat = ({ onApiLimit }) => {
  const { user } = useAuth();
  const { messages, isLoading, error, handleSendMessage } = useChat(); // Added error to destructuring
  const { privacySettings } = usePrivacy();
  const chatEndRef = useRef(null);
  const [currentSession, setCurrentSession] = useState([]);

  useEffect(() => {
    setCurrentSession([]);
  }, []);

  useEffect(() => {
    const latestMessage = messages[messages.length - 1];
    if (latestMessage && !currentSession.some(m =>
      m.text === latestMessage.text &&
      m.sender === latestMessage.sender)) {
      setCurrentSession(prev => [...prev, latestMessage]);
    }
  }, [messages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentSession]);

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

  if (!user) {
    return (
      <motion.div
        className="chat-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="bg-[#151235] p-8 rounded-lg shadow-lg text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-white">Please Log In</h2>
          <p className="mb-6 text-gray-300">You need to log in to use the chat.</p>
          <Link
            to="/login"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
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
        {currentSession.map((msg, index) => (
          <ChatMessage key={index} sender={msg.sender} text={msg.text} />
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Show error message if present */}
      {error && (
        <div className="error-message bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      <ChatInput
        onSend={(message) => {
          console.log("Chat.js onSend triggered:", message);
          handleSendMessage(message, privacySettings);
        }}
        isLoading={isLoading}
      />

      <div className="text-center mt-4">
      <Link
        to="/privacy-center"
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Privacy Settings
      </Link>
      </div>
    </motion.div>
  );
};

export default Chat;
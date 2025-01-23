// src/components/Chat.js
import React, { useState } from "react";
import { motion } from "framer-motion";

const Chat = () => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  const handleSendMessage = () => {
    if (message.trim() === "") return;

    // Add user message to chat history
    setChatHistory((prev) => [...prev, { sender: "user", text: message }]);

    // Simulate AI response
    setTimeout(() => {
      setChatHistory((prev) => [...prev, { sender: "ai", text: "This is a response from BudAi." }]);
    }, 500);

    // Clear input
    setMessage("");
  };

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
            {msg.text}
          </motion.div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleSendMessage}
        >
          Send
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Chat;
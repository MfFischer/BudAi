import React, { useState } from "react";
import { motion } from "framer-motion";

const ChatInput = ({ onSend, isLoading }) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() === "" || isLoading) return;
    onSend(message);
    setMessage("");
  };

  return (
    <form onSubmit={handleSubmit} className="chat-input">
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
  );
};

export default ChatInput;
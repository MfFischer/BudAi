// src/components/Chat.js
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const Chat = () => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const chatEndRef = useRef(null);

  const handleSendMessage = async () => {
    if (message.trim() === "") return;

    // Add user message to chat history
    setChatHistory((prev) => [...prev, { sender: "user", text: message }]);

    // Send message to backend
    try {
      const response = await axios.post("/api/chat", { message });
      const { aiResponse, activities } = response.data;

      // Add AI response to chat history
      setChatHistory((prev) => [
        ...prev,
        { sender: "ai", text: aiResponse },
        { sender: "ai", text: `Suggested Activities: ${activities.join(", ")}` },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
    }

    // Clear input
    setMessage("");
  };

  // Scroll to the bottom of the chat when a new message is added
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory]);

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
        <div ref={chatEndRef} /> {/* Empty div to scroll to */}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
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
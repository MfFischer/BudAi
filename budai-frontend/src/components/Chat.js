// src/components/Chat.js
import React, { useState } from "react";
import { sendMessageToGemini } from "../services/gemini";

const Chat = () => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  const handleSendMessage = async () => {
    if (message.trim() === "") return;

    // Add user message to chat history
    setChatHistory((prev) => [...prev, { sender: "user", text: message }]);

    // Get AI response
    const aiResponse = await sendMessageToGemini(message);
    setChatHistory((prev) => [...prev, { sender: "ai", text: aiResponse }]);

    // Clear input
    setMessage("");
  };

  return (
    <div className="chat-container">
      <div className="chat-history">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
// src/components/Chat.js
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { auth } from "../firebase/config";

const Chat = () => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const chatEndRef = useRef(null);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    
    if (message.trim() === "") return;

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

      const token = await currentUser.getIdToken();
      
      // Add user message to chat immediately
      setChatHistory(prev => [...prev, { sender: "user", text: message }]);
      
      const sentMessage = message;
      setMessage("");

      const response = await axios.post(
        "http://localhost:5000/api/chat",
        { 
          message: sentMessage,
          uid: currentUser.uid  // Add user ID to request
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setChatHistory(prev => [...prev, { sender: "ai", text: response.data.aiResponse }]);
    } catch (error) {
      console.error("Error sending message:", error);
      setChatHistory(prev => [...prev, { 
        sender: "system", 
        text: `Error: ${error.response?.data?.error || error.message}` 
      }]);
    }
  };

  // Load chat history when component mounts
  useEffect(() => {
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

        setChatHistory(response.data.map(chat => ({
          sender: chat.sender,
          text: chat.message
        })));
      } catch (error) {
        console.error("Error loading chat history:", error);
      }
    };

    loadChatHistory();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="chat-input">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="chat-input-field"
        />
        <motion.button
          type="submit"
          className="chat-send-button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          Send
        </motion.button>
      </form>
    </motion.div>
  );
};

// Add this CSS either in your component using styled-components or in your CSS file
const styles = `
  .chat-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f5f5f5;
  }

  .chat-history {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .message {
    display: flex;
    margin-bottom: 10px;
  }

  .message.user {
    justify-content: flex-end;
  }

  .message.ai {
    justify-content: flex-start;
  }

  .message.system {
    justify-content: center;
  }

  .message-bubble {
    max-width: 70%;
    padding: 10px 15px;
    border-radius: 15px;
    background-color: #fff;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .message.user .message-bubble {
    background-color: #007bff;
    color: white;
  }

  .message.ai .message-bubble {
    background-color: #e9ecef;
    color: #212529;
  }

  .message.system .message-bubble {
    background-color: #dc3545;
    color: white;
    font-style: italic;
  }

  .chat-input {
    display: flex;
    gap: 10px;
    padding: 15px;
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .chat-input-field {
    flex: 1;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 5px;
    outline: none;
    font-size: 16px;
  }

  .chat-input-field:focus {
    border-color: #007bff;
  }

  .chat-send-button {
    padding: 12px 24px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 500;
    transition: background-color 0.2s;
  }

  .chat-send-button:hover {
    background-color: #0056b3;
  }

  /* Scrollbar styling */
  .chat-history::-webkit-scrollbar {
    width: 6px;
  }

  .chat-history::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  .chat-history::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;
  }

  .chat-history::-webkit-scrollbar-thumb:hover {
    background: #555;
  }

  /* Mobile responsiveness */
  @media (max-width: 768px) {
    .chat-container {
      padding: 10px;
    }

    .message-bubble {
      max-width: 85%;
    }

    .chat-input {
      padding: 10px;
    }

    .chat-input-field {
      padding: 8px;
    }

    .chat-send-button {
      padding: 8px 16px;
    }
  }
`;

// Add styles to document
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default Chat;
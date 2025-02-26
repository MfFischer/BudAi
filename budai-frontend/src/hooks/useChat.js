import { useState, useEffect, useCallback } from "react";
import { fetchChatHistory, sendMessage } from "../services/chatService";
import { useAuth } from "../contexts/AuthContext";

export const useChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadChatHistory = useCallback(async () => {
    try {
      if (!user) return;

      const token = await user.getIdToken();
      const history = await fetchChatHistory(user.uid, token);
      console.log("Raw chat history:", history);
      
      // Transform backend data format to frontend format
      const formattedMessages = history.data.map(msg => ({
        id: msg.id || Date.now(),
        sender: msg.sender,
        text: msg.message // Convert "message" property to "text"
      }));
      
      console.log("Formatted chat history:", formattedMessages);
      setMessages(formattedMessages);
    } catch (error) {
      console.error("Error loading chat history:", error);
    }
  }, [user]);

  const handleSendMessage = async (message, privacySettings) => {
    try {
      if (!user) return;

      // Show user message immediately
      setMessages(prev => [...prev, { 
        id: `user-${Date.now()}`,
        sender: "user", 
        text: message 
      }]);
      
      setIsLoading(true);
      const token = await user.getIdToken();
      const response = await sendMessage(message, user.uid, token, privacySettings);
      console.log("API response:", response);
      
      // Handle multiple possible response formats
      const aiResponseText = response.message || response.aiResponse || "No response";
      
      setMessages(prev => [...prev, { 
        id: `ai-${Date.now()}`,
        sender: "ai", 
        text: aiResponseText 
      }]);
    } catch (error) {
      console.error("Error sending message:", error);
      // Show error message to user
      setMessages(prev => [...prev, { 
        id: `error-${Date.now()}`,
        sender: "ai", 
        text: "Sorry, I couldn't process your message right now. Please try again." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadChatHistory();
    }
  }, [user, loadChatHistory]); // Include both user and loadChatHistory as dependencies

  return { 
    messages, 
    isLoading, 
    handleSendMessage,
    refreshChat: loadChatHistory // Export this to allow manual refresh
  };
};
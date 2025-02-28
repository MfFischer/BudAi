import { useState, useEffect, useCallback } from "react";
import { fetchChatHistory, sendMessage } from "../services/chatService";
import { useAuth } from "../contexts/AuthContext";

// Using named export to match your component's import
export const useChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadChatHistory = useCallback(async () => {
    try {
      if (!user) {
        console.log("No user available for chat history");
        return;
      }

      console.log("Loading chat history for user:", user.uid);
      setIsLoading(true);
      
      const token = await user.getIdToken(true); // Force refresh token
      console.log("Fetching history with token (first 10 chars):", token.substring(0, 10) + "...");
      
      const history = await fetchChatHistory(user.uid, token);
      console.log("Chat history received:", history);
      
      if (!history.data || !Array.isArray(history.data)) {
        console.error("Invalid history format:", history);
        setError("Invalid history format received");
        return;
      }
      
      const formattedMessages = history.data.map(msg => ({
        id: msg.id || Date.now(),
        sender: msg.sender,
        text: msg.message
      }));
      
      console.log("Formatted chat history:", formattedMessages);
      setMessages(formattedMessages);
      setError(null);
    } catch (error) {
      console.error("Error loading chat history:", error);
      setError("Failed to load chat history");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const handleSendMessage = async (message, privacySettings) => {
    console.log("handleSendMessage called with message:", message);
    
    try {
      if (!user) {
        console.error("No user authenticated in useChat");
        setError("Not authenticated");
        throw new Error("Not authenticated");
      }
      
      console.log("User in useChat:", user.uid);
      
      // Add user message to UI immediately
      const userMessage = {
        id: `user-${Date.now()}`,
        sender: "user",
        text: message
      };
      
      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);
      
      // Get fresh token
      const token = await user.getIdToken(true);
      console.log("Sending message with token (first 10 chars):", token.substring(0, 10) + "...");
      
      try {
        const response = await sendMessage(message, user.uid, token, privacySettings);
        console.log("API response:", response);
        
        // Check both response formats - your backend might return either
        // response.message or response.aiResponse
        const aiResponseText = response.message || response.aiResponse;
        
        if (aiResponseText) {
          // Add AI response to messages
          const aiMessage = {
            id: `ai-${Date.now()}`,
            sender: "ai",
            text: aiResponseText
          };
          
          setMessages(prev => [...prev, aiMessage]);
        } else {
          console.error("Invalid response format:", response);
          setError("Received invalid response format");
        }
      } catch (apiError) {
        console.error("API error:", apiError);
        setError(`API error: ${apiError.message || "Unknown error"}`);
        
        // Check for network errors
        if (apiError.message && apiError.message.includes("Network Error")) {
          console.log("Network error detected - check if backend is running and accessible");
        }
        
        // Check for CORS issues
        if (apiError.message && apiError.message.includes("CORS")) {
          console.log("CORS error detected - check backend CORS configuration");
        }
      }
    } catch (error) {
      console.error("Error in handleSendMessage:", error);
      setError(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadChatHistory();
    } else {
      console.log("No user available, skipping chat history load");
    }
  }, [user, loadChatHistory]);

  return {
    messages,
    isLoading,
    error,
    handleSendMessage,
    refreshChat: loadChatHistory
  };
};
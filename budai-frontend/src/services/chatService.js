// src/services/chatService.js
import { api, authHeader } from '../utils/apiConfig';

export const sendMessage = async (message, uid, token, privacySettings) => {
  console.log("Sending message:", message);
  
  try {
    const response = await api.post(
      '/api/chat',
      { 
        message, 
        analyticsConsent: privacySettings?.analyticsConsent, 
        marketingConsent: privacySettings?.marketingConsent 
      },
      authHeader(token)
    );
    
    console.log("Message response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error sending message:", error);
    
    // More detailed error logging
    if (error.response) {
      console.error("Response error data:", error.response.data);
      console.error("Response error status:", error.response.status);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Request setup error:", error.message);
    }
    
    throw error;
  }
};

export const fetchChatHistory = async (uid, token) => {
  console.log("Fetching chat history for user:", uid);
  
  try {
    const response = await api.get(`/api/chat/chat-history/${uid}`, authHeader(token));
    console.log("History response status:", response.status);
    console.log("History data count:", response.data?.data?.length || 0);
    
    return response.data;
  } catch (error) {
    console.error("Error fetching history:", error);
    
    // More detailed error logging
    if (error.response) {
      console.error("Response error data:", error.response.data);
      console.error("Response error status:", error.response.status);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Request setup error:", error.message);
    }
    
    throw error;
  }
};
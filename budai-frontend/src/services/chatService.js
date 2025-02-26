import axios from "axios";

const BACKEND_API_URL = "https://budai-backend-66e5de8d33a8.herokuapp.com";

export const fetchChatHistory = async (uid, token) => {
  try {
    const response = await axios.get(
      `${BACKEND_API_URL}/api/chat/chat-history/${uid}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching chat history:", error);
    throw error; // Let calling component handle it
  }
};

export const sendMessage = async (message, uid, token, privacySettings) => {
  try {
    const response = await axios.post(
      `${BACKEND_API_URL}/api/chat`,
      {
        message,
        // uid not needed in body; backend adds it via verifyAuth
        analyticsConsent: privacySettings.analyticsConsent,
        marketingConsent: privacySettings.marketingConsent,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error; // Let calling component handle it
  }
};
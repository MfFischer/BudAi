import axios from "axios";

export const fetchChatHistory = async (uid, token) => {
  const response = await axios.get(
    `http://localhost:5000/api/chat/chat-history/${uid}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

export const sendMessage = async (message, uid, token, privacySettings) => {
  const response = await axios.post(
    "http://localhost:5000/api/chat",
    {
      message,
      uid,
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
};
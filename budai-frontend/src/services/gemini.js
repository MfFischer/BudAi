import axios from "axios";

// Backend API URL (Heroku)
const BACKEND_API_URL = "https://budai-backend-66e5de8d33a8.herokuapp.com";

export const sendMessageToGemini = async (message) => {
  try {
    const response = await axios.post(
      `${BACKEND_API_URL}/api/chat`,
      { message }, // Send message as JSON body
      {
        headers: {
          "Content-Type": "application/json",
          // Add Authorization header if your backend requires it (e.g., Firebase Auth token)
          // "Authorization": `Bearer ${yourAuthToken}`,
        },
      }
    );
    // Adjust based on your backend's response structure
    return response.data.message || "Sorry, no response from backend.";
  } catch (error) {
    console.error("Error sending message to backend:", error);
    return "Sorry, I couldn't process your request.";
  }
};
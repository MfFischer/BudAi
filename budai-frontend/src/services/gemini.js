// src/services/gemini.js
import axios from "axios";

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent";

export const sendMessageToGemini = async (message) => {
  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: message,
              },
            ],
          },
        ],
      }
    );
    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    return "Sorry, I couldn't process your request.";
  }
};
// backend/utils/apiHelpers.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

const handleResponse = (res, statusCode, data) => {
  res.status(statusCode).json(data);
};

const handleError = (res, error) => {
  console.error("Server Error:", error);
  res.status(500).json({ error: error.message });
};

const sendMessageToGemini = async (prompt) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    if (!text) {
      throw new Error("Empty response from Gemini API");
    }
    
    return text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    // More specific fallback for production
    if (error.message.includes("quota") || error.message.includes("rate limit")) {
      return "Looks like we’ve hit a limit for now—let’s try again later!";
    }
    return "I’m having trouble processing that. Could you say it again?";
  }
};

module.exports = { handleResponse, handleError, sendMessageToGemini };
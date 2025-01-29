// backend/utils/apiHelpers.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

const handleResponse = (res, statusCode, data) => {
  res.status(statusCode).json(data);
};

const handleError = (res, error) => {
  console.error(error);
  res.status(500).json({ error: error.message });
};

const sendMessageToGemini = async (prompt) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

module.exports = { handleResponse, handleError, sendMessageToGemini };
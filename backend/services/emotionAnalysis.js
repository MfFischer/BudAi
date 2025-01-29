// backend/services/emotionAnalysis.js
const { sendMessageToGemini } = require("../utils/apiHelpers");

const analyzeEmotion = async (text) => {
  try {
    const prompt = `
      Analyze the emotional content of this message and return a JSON object with the following structure:
      {
        "score": (number between -1 and 1),
        "magnitude": (number between 0 and 1),
        "dominantEmotion": (one of: "happy", "sad", "angry", "confused", "neutral"),
        "emotionalKeywords": [array of emotional words found in the text]
      }
      
      Message to analyze: "${text}"

      Return ONLY the JSON object, no additional text or backticks.
    `;

    const result = await sendMessageToGemini(prompt);
    
    // Clean the response from any backticks or extra text
    const cleanResult = result.replace(/^```json\s*|\s*```$/g, '').trim();
    
    try {
      const parsedResult = JSON.parse(cleanResult);
      
      // Validate the parsed result has all required fields
      if (!parsedResult.hasOwnProperty('score') || 
          !parsedResult.hasOwnProperty('magnitude') || 
          !parsedResult.hasOwnProperty('dominantEmotion') || 
          !parsedResult.hasOwnProperty('emotionalKeywords')) {
        throw new Error('Invalid response structure');
      }

      // Validate value ranges
      parsedResult.score = Math.max(-1, Math.min(1, parsedResult.score));
      parsedResult.magnitude = Math.max(0, Math.min(1, parsedResult.magnitude));
      
      // Validate dominantEmotion
      const validEmotions = ["happy", "sad", "angry", "confused", "neutral"];
      if (!validEmotions.includes(parsedResult.dominantEmotion)) {
        parsedResult.dominantEmotion = "neutral";
      }

      // Ensure emotionalKeywords is an array
      if (!Array.isArray(parsedResult.emotionalKeywords)) {
        parsedResult.emotionalKeywords = [];
      }

      return parsedResult;
    } catch (parseError) {
      console.error("Error parsing Gemini response:", parseError);
      console.log("Raw response:", result);
      throw new Error('Failed to parse emotion analysis result');
    }
  } catch (error) {
    console.error("Error in emotion analysis:", error);
    // Return default neutral emotion if analysis fails
    return {
      score: 0,
      magnitude: 0,
      dominantEmotion: "neutral",
      emotionalKeywords: []
    };
  }
};

module.exports = { analyzeEmotion };
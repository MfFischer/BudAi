// backend/services/aiResponse.js
const { sendMessageToGemini } = require("../utils/apiHelpers");
const { suggestActivities } = require("./activitySuggestion");

const generateResponse = async (message, emotion, history) => {
  try {
    const prompt = `
      You are Budd, an emotionally intelligent AI companion. You're already in a conversation with the user, 
      so respond naturally without reintroducing yourself. Maintain conversation context and flow.

      Key behaviors:
      - Never reintroduce yourself mid-conversation
      - Give specific, actionable suggestions when asked
      - Stay focused on the current topic
      - Respond directly to questions
      - Be warm and empathetic, like a supportive friend
      - Keep responses concise but helpful
      
      Previous context: The user has been discussing ${history.length > 0 ? history[history.length - 1].message : 'various topics'}
      Current user emotion: ${emotion.dominantEmotion}
      User message: ${message}

      Respond in a natural, friendly way without any formatting or labels. If suggesting activities or options,
      provide specific examples rather than asking what type they want.
    `;

    const response = await sendMessageToGemini(prompt);
    
    // Clean up any formatting
    return response
      .replace(/\*\*/g, '')
      .replace(/Hi,? I'?m Budd/gi, '')
      .replace(/Hello,? I'?m Budd/gi, '')
      .replace(/Hey,? I'?m Budd/gi, '')
      .replace(/Let me suggest/gi, 'Here are')
      .trim();
  } catch (error) {
    console.error("Error generating response:", error);
    return "I apologize, but I'm having trouble processing that right now. Could you please try again?";
  }
};

module.exports = { generateResponse };
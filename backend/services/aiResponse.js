// backend/services/aiResponse.js
const { sendMessageToGemini } = require("../utils/apiHelpers");

const generateResponse = async (message, emotion, history) => {
  try {
    const lastMessage = history.length > 0 
      ? history[history.length - 1].message 
      : '';
      
    // Check if this is first message of the day
    const isFirstMessageToday = !history.length || isNewDay(history[0].timestamp);
    
    const prompt = `
      You are Budd, having a natural ongoing conversation with a friend.
      
      ${isFirstMessageToday ? `
        This is their first message today. If they're saying hello or hi, 
        warmly greet them and ask how they're doing today.
      ` : `
        You're in the middle of a conversation. Their last message was: "${lastMessage}"
        Current context: Respond naturally to continue the ongoing discussion.
      `}

      Their current mood seems: ${emotion.dominantEmotion}
      They just said: "${message}"

      Core elements for your response:
      - Keep your tone warm and genuine
      - Mirror their level of energy/emotion naturally
      - Only give advice if they specifically ask
      - Show you're listening by picking up on details they share
      - Use casual language with natural pauses
      - Keep responses concise but engaging
      
      Reply conversationally, without any special formatting.`;

    const response = await sendMessageToGemini(prompt);
    
    // Clean up AI-like language patterns
    return response
      .replace(/I understand that/gi, '')
      .replace(/I hear that/gi, '')
      .replace(/I sense that/gi, '')
      .replace(/I can see that/gi, '')
      .replace(/I acknowledge/gi, '')
      .replace(/I appreciate/gi, '')
      .replace(/that must be/gi, '')
      .replace(/That's wonderful!/gi, '')
      .replace(/I hope you/gi, '')
      .replace(/\b(please|kindly)\b/gi, '')
      .replace(/Let me/gi, '')
      .replace(/Indeed/gi, '')
      .replace(/It sounds like/gi, '')
      .replace(/I'm here to/gi, '')
      .replace(/feel free to/gi, '')
      .trim();

  } catch (error) {
    console.error("Error generating response:", error);
    return "Sorry, I didn't catch that - mind saying it again?";
  }
};

// Helper function to check if it's a new day
const isNewDay = (lastTimestamp) => {
  if (!lastTimestamp) return true;
  
  const lastDate = new Date(lastTimestamp);
  const currentDate = new Date();
  
  return lastDate.toDateString() !== currentDate.toDateString();
};

module.exports = { generateResponse };
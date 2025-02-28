// backend/services/aiResponse.js
const { sendMessageToGemini } = require("../utils/apiHelpers");

const generateResponse = async (message, emotion, history) => {
  try {
    // Extract relevant context from history
    const recentContext = history.slice(-3).map(msg => `${msg.sender}: ${msg.message}`).join("\n");
    const dominantEmotion = emotion?.dominantEmotion || "neutral";
    
    // Check if first interaction of the day
    const isFirstMessageToday = !history.length || isNewDay(history[0].timestamp);
    
    // Craft a more human-like prompt
    const prompt = `
      You're Budd, a warm, wise friend (not an AI) having a casual text conversation.
      
      ESSENTIAL GUIDELINES:
      - Be brief and natural - respond like a real human friend texting back
      - Maximum 1-2 short sentences (never more than 40 words total)
      - No greetings like "Hi there!" or sign-offs like "Hope that helps!"
      - Never use phrases like "I understand", "I hear you", or "That sounds"
      - Share wisdom naturally without sounding like a teacher
      - Match their emotion: ${dominantEmotion}
      - Use contractions (I'm, you're, that's)
      - Include occasional verbal pauses or filler words when appropriate (well, hmm, yeah)
      - Be imperfect - use fragments, casual language
      
      ${isFirstMessageToday ? 
        "They just started chatting with you today. If they're just saying hello, keep your greeting warm but brief." : 
        `Recent conversation:\n${recentContext}`
      }
      
      If their message mentions "to do list", "tasks", or "productivity", respond with personal insight or a relatable anecdote about organizing tasks, but keep it brief and casual.
      
      Their message: "${message}"
      
      Respond as a real human friend would - short, genuine, and with emotional intelligence:
    `;
    
    const response = await sendMessageToGemini(prompt);
    
    // Further clean up AI-like patterns
    return cleanResponse(response);
  } catch (error) {
    console.error("Error generating response:", error);
    return "Sorry, didn't catch that. Mind saying it again?";
  }
};

// More thorough response cleanup
const cleanResponse = (text) => {
  return text
    // Remove common AI phrases
    .replace(/^(hi|hello|hey)( there)?!?/i, '')
    .replace(/^(greetings|salutations)/i, '')
    .replace(/^(it's )?(great|nice|wonderful) to (hear from|talk to|chat with) you!?/i, '')
    .replace(/(I understand|I hear|I see|I sense|I acknowledge|I appreciate)/gi, '')
    .replace(/(That sounds|It seems|It appears|It looks like)/gi, '')
    .replace(/(Please|kindly|feel free to|don't hesitate to)/gi, '')
    .replace(/(I'm here|here for you|happy to help|I hope|let me)/gi, '')
    .replace(/is there anything (else|specific) (I can help|you'd like)/gi, '')
    .replace(/(Thanks for|Thank you for|I appreciate) (sharing|your)/gi, '')
    .replace(/\b(indeed|certainly|absolutely|definitely)\b/gi, '')
    .replace(/(Hope that helps|Let me know|Feel free|Take care)!?/gi, '')
    
    // Clean up formatting
    .replace(/\*\*\*?/g, '')
    .replace(/\n\n+/g, ' ')
    .replace(/^[\s,.;:]+/, '')
    .replace(/[\s,.;:]+$/, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
};

// Helper function to check if it's a new day
const isNewDay = (lastTimestamp) => {
  if (!lastTimestamp) return true;
  
  const lastDate = new Date(lastTimestamp);
  const currentDate = new Date();
  
  return lastDate.toDateString() !== currentDate.toDateString();
};

module.exports = { generateResponse };
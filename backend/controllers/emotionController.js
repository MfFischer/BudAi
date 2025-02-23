const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyzeEmotion = async (text) => {
  try {
    const prompt = `Analyze the emotional content of this text and return only one word representing the dominant emotion (e.g., happy, sad, angry, neutral, excited, anxious): "${text}"`;
    
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const emotion = await result.response.text();
    
    // Clean and validate the emotion
    return emotion.toLowerCase().trim();
  } catch (error) {
    console.error('Emotion analysis error:', error);
    return 'neutral'; // Default fallback
  }
};

exports.analyzeEmotion = analyzeEmotion;
const { sendMessageToGemini } = require("../utils/apiHelpers");
const { analyzeEmotion } = require("../services/emotionAnalysis");
const { db } = require("../config/firebase");

exports.handleChat = async (req, res) => {
  try {
    const userId = req.user?.id || req.ip;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Message is required' 
      });
    }

    // Try to analyze emotion and get chat response
    try {
      const [emotionAnalysis, response] = await Promise.all([
        analyzeEmotion(message),
        sendMessageToGemini(message)
      ]);

      // Store chat in Firestore
      await db.collection('chats').add({
        uid: userId,
        message: message,
        response: response,
        emotion: emotionAnalysis.dominantEmotion,
        emotionalData: emotionAnalysis,
        timestamp: db.FieldValue.serverTimestamp()
      });

      return res.json({
        success: true,
        message: response,
        emotion: emotionAnalysis
      });

    } catch (apiError) {
      // Check if error is related to API quota
      if (apiError.message?.includes('RESOURCE_EXHAUSTED') || 
          apiError.message?.includes('quota') || 
          apiError.message?.includes('rate limit')) {
        
        const resetTime = new Date();
        resetTime.setHours(24, 0, 0, 0); // Reset at midnight

        return res.status(429).json({
          success: false,
          error: 'Free messaging limit reached',
          resetTime: resetTime.toISOString(),
          message: 'The free messaging tier has been exhausted. Services will reset at midnight Pacific Time.'
        });
      }

      // For other API errors, return a generic error
      throw apiError;
    }

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      success: false,
      error: 'An error occurred while processing your message'
    });
  }
};

// Updated chat history endpoint
exports.getChatHistory = async (req, res) => {
  try {
    const { uid } = req.params;
    
    if (!uid) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    const chatHistory = await db.collection('chats')
      .where('uid', '==', uid)
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();

    const messages = chatHistory.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate()
    }));

    res.json({
      success: true,
      data: messages
    });

  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chat history'
    });
  }
};
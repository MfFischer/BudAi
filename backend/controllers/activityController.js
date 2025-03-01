// controllers/activityControllers.js
const { suggestActivities } = require('../services/activitySuggestions');
const { db } = require('../config/firebase');

/**
 * Get activity suggestions based on user's recent emotion data
 */
const getActivitySuggestions = async (req, res) => {
  try {
    const { uid } = req.params;
    
    // Get the user's most recent chat data to extract emotion
    const chatSnapshot = await db.collection('user_chats')
      .where('uid', '==', uid)
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();
      
    let emotionData = { dominantEmotion: 'neutral' };
    let userMessage = '';
    
    if (!chatSnapshot.empty) {
      const chatData = chatSnapshot.docs[0].data();
      emotionData = chatData.emotion || { dominantEmotion: 'neutral' };
      userMessage = chatData.userMessage || '';
    }
    
    // Use the emotion data to get personalized suggestions
    const suggestionData = await suggestActivities(uid, emotionData, userMessage);
    
    res.json({
      success: true,
      data: suggestionData
    });
  } catch (error) {
    console.error("Error getting activity suggestions:", error);
    
    // Handle rate limit errors specifically
    if (error.status === 429) {
      return res.status(429).json({
        success: false,
        error: error.message,
        resetTime: error.resetTime
      });
    }
    
    res.status(500).json({
      success: false,
      error: "Failed to get activity suggestions"
    });
  }
};

/**
 * Save a journal entry for the user
 */
const submitJournalEntry = async (req, res) => {
  try {
    const { uid } = req.params;
    const { entry } = req.body;
    
    if (!entry || typeof entry !== 'string' || entry.trim() === '') {
      return res.status(400).json({
        success: false,
        error: "Journal entry cannot be empty"
      });
    }
    
    // Add entry to database
    const entryRef = await db.collection('journal_entries').add({
      uid,
      entry,
      timestamp: new Date()
    });
    
    res.json({
      success: true,
      data: {
        id: entryRef.id,
        entry,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error("Error submitting journal entry:", error);
    res.status(500).json({
      success: false,
      error: "Failed to save journal entry"
    });
  }
};

module.exports = {
  getActivitySuggestions,
  submitJournalEntry
};
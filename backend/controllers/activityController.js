const { suggestActivities } = require('../services/activitySuggestion');
const { db } = require('../config/firebase');

exports.getActivitySuggestions = async (req, res) => {
  try {
    const { uid } = req.params;

    // Get user's recent chat messages
    const recentChats = await db.collection("chats")
      .where("uid", "==", uid)
      .orderBy("timestamp", "desc")
      .limit(5)
      .get();

    const latestChat = recentChats.docs[0]?.data();
    const recentEmotion = {
      dominantEmotion: latestChat?.emotion || "neutral"
    };
    const recentMessage = latestChat?.message || "";

    try {
      const suggestions = await suggestActivities(uid, recentEmotion, recentMessage);
      res.json({
        success: true,
        data: suggestions // This will now include all the required fields
      });
    } catch (apiError) {
      if (apiError.status === 429) {
        return res.status(429).json({
          success: false,
          error: 'Free messaging limit reached',
          resetTime: apiError.resetTime,
          message: 'The free messaging tier has been exhausted. Services will reset at midnight Pacific Time.'
        });
      }
      throw apiError;
    }

  } catch (error) {
    console.error("Error getting activity suggestions:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get suggestions",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.submitJournalEntry = async (req, res) => {
  try {
    const { uid } = req.params;
    const { entry } = req.body;

    if (!entry) {
      return res.status(400).json({
        success: false,
        error: 'Journal entry is required'
      });
    }

    // Save journal entry
    await db.collection('journal_entries').add({
      uid,
      entry,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: "Journal entry saved successfully"
    });

  } catch (error) {
    console.error('Error submitting journal entry:', error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to save journal entry" 
    });
  }
};
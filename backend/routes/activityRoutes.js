const express = require("express");
const router = express.Router();
const { suggestActivities } = require("../services/activitySuggestion");
const { db } = require("../config/firebase");

router.get("/suggestions/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    
    // Get user's recent chat messages
    const recentChats = await db.collection("chats")
      .where("uid", "==", uid)
      .orderBy("timestamp", "desc")
      .limit(5)
      .get();

    // Get the most recent message and emotion
    const latestChat = recentChats.docs[0]?.data();
    const recentEmotion = {
      dominantEmotion: latestChat?.emotion || "neutral"
    };
    const recentMessage = latestChat?.message || "";

    // Get personalized suggestions
    const suggestions = await suggestActivities(recentEmotion, recentMessage);
    res.json(suggestions);
  } catch (error) {
    console.error("Error getting activity suggestions:", error);
    res.status(500).json({ error: "Failed to get suggestions" });
  }
});

module.exports = router;
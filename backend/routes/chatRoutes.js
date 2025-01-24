const express = require("express");
const router = express.Router();
const { analyzeEmotion } = require("../services/emotionAnalysis");
const { generateResponse } = require("../services/aiResponse");
const { suggestActivities } = require("../services/activitySuggestion");

router.post("/chat", async (req, res) => {
  const { message } = req.body;

  try {
    // Analyze emotion
    const emotion = await analyzeEmotion(message);

    // Generate AI response
    const aiResponse = await generateResponse(message, emotion);

    // Suggest activities
    const activities = suggestActivities(emotion);

    res.status(200).json({ aiResponse, activities });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
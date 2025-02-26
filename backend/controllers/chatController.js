const { admin, db } = require("../config/firebase"); // Import admin along with db
const { sendMessageToGemini } = require("../utils/apiHelpers");
const { analyzeEmotion } = require("../services/emotionAnalysis");
const { generateResponse } = require("../services/aiResponse");

// Handle chat messages
exports.handleChat = async (req, res) => {
  try {
    const userId = req.user?.id || req.ip;
    const { message } = req.body;

    // Validate input
    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        error: "Invalid input: Message is required and must be a string.",
      });
    }

    // Check bot identity questions
    if (
      message.toLowerCase().includes("your name") ||
      message.toLowerCase().includes("who are you")
    ) {
      const botResponse = "I'm Budd, your intelligent emotional companion. How can I assist you today?";

      // Save conversation
      await Promise.all([
        db.collection("chats").add({
          uid: userId,
          message,
          sender: "user",
          timestamp: admin.firestore.FieldValue.serverTimestamp(), // Use admin.firestore.FieldValue
        }),
        db.collection("chats").add({
          uid: userId,
          message: botResponse,
          sender: "ai",
          timestamp: admin.firestore.FieldValue.serverTimestamp(), // Use admin.firestore.FieldValue
        }),
      ]);

      return res.json({
        success: true,
        aiResponse: botResponse,
      });
    }

    // Get chat history for context
    const chatHistory = await db
      .collection("chats")
      .where("uid", "==", userId)
      .orderBy("timestamp", "desc")
      .limit(5)
      .get();

    // Format history properly
    const history = chatHistory.docs
      .map((doc) => ({
        message: doc.data().message,
        sender: doc.data().sender,
        timestamp: doc.data().timestamp,
      }))
      .reverse();

    // Analyze emotion and generate response
    const [emotion, aiResponse] = await Promise.all([
      analyzeEmotion(message),
      generateResponse(message, { dominantEmotion: "neutral" }, history || []),
    ]);

    // Save messages
    await Promise.all([
      db.collection("chats").add({
        uid: userId,
        message,
        sender: "user",
        emotion: emotion.dominantEmotion,
        timestamp: admin.firestore.FieldValue.serverTimestamp(), // Use admin.firestore.FieldValue
      }),
      db.collection("chats").add({
        uid: userId,
        message: aiResponse,
        sender: "ai",
        timestamp: admin.firestore.FieldValue.serverTimestamp(), // Use admin.firestore.FieldValue
      }),
    ]);

    res.json({
      success: true,
      message: aiResponse,
      emotion: emotion.dominantEmotion,
    });
  } catch (apiError) {
    // ... Error handling remains unchanged ...
  }
};

// Fetch chat history (no changes needed here since it doesn’t use serverTimestamp)
exports.getChatHistory = async (req, res) => {
  // ... Existing code ...
};
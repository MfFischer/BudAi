// backend/routes/chatRoutes.js
const express = require("express");
const router = express.Router();
const { admin, db } = require("../config/firebase");
const { analyzeEmotion } = require("../services/emotionAnalysis");
const { generateResponse } = require("../services/aiResponse");
const { handleResponse, handleError } = require("../utils/apiHelpers");

// Main chat endpoint
router.post("/", async (req, res) => {
  try {
    const { message, uid } = req.body;
    if (!message) {
      return handleResponse(res, 400, { error: 'Message is required' });
    }

    // Check for specific user questions about the bot
    if (message.toLowerCase().includes("your name") || message.toLowerCase().includes("who are you")) {
      const botIdentityResponse = "I'm Budd, your intelligent emotional companion. How can I assist you today?";
      
      // Save conversation to Firestore
      await db.collection("chats").add({
        uid,
        message,
        sender: 'user',
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      await db.collection("chats").add({
        uid,
        message: botIdentityResponse,
        sender: 'ai',
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      return handleResponse(res, 200, {
        aiResponse: botIdentityResponse,
        timestamp: Date.now()
      });
    }

    // Fetch chat history for context - Updated query
    const chatHistory = await db.collection("chats")
      .where("uid", "==", uid)
      .orderBy("timestamp", "desc")
      .limit(5)
      .get();

    const history = chatHistory.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .reverse();

    let emotion;
    try {
      emotion = await analyzeEmotion(message);
      console.log("Detected emotion:", emotion);
    } catch (emotionError) {
      console.error("Error analyzing emotion:", emotionError);
      emotion = { dominantEmotion: 'neutral' };
    }

    // Generate AI response
    const aiResponse = await generateResponse(message, emotion, history);

    // Save user message to Firestore
    await db.collection("chats").add({
      uid,
      message,
      sender: 'user',
      emotion: emotion.dominantEmotion,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    // Save AI response to Firestore
    await db.collection("chats").add({
      uid,
      message: aiResponse,
      sender: 'ai',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    handleResponse(res, 200, {
      aiResponse,
      emotion: emotion.dominantEmotion,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error("Chat error:", error);
    handleError(res, error);
  }
});

// Chat history endpoint
router.get("/chat-history/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    
    // Verify user owns this chat history
    if (!req.user || uid !== req.user.uid) {
      return handleResponse(res, 403, { error: 'Unauthorized access to chat history' });
    }

    const chats = await db.collection("chats")
      .where("uid", "==", uid)
      .orderBy("timestamp", "asc")
      .limit(50)
      .get();

    const chatHistory = chats.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp ? doc.data().timestamp.toDate() : null
    }));

    handleResponse(res, 200, chatHistory);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    handleError(res, error);
  }
});

// Delete chat message endpoint
router.delete("/message/:messageId", async (req, res) => {
  try {
    const { messageId } = req.params;
    const { uid } = req.body;

    // Verify user owns this message
    const messageRef = db.collection("chats").doc(messageId);
    const message = await messageRef.get();

    if (!message.exists) {
      return handleResponse(res, 404, { error: 'Message not found' });
    }

    if (message.data().uid !== uid) {
      return handleResponse(res, 403, { error: 'Unauthorized to delete this message' });
    }

    await messageRef.delete();
    handleResponse(res, 200, { message: 'Message deleted successfully' });
  } catch (error) {
    console.error("Error deleting message:", error);
    handleError(res, error);
  }
});

// Clear chat history endpoint
router.delete("/clear-history/:uid", async (req, res) => {
  try {
    const { uid } = req.params;

    // Verify user owns this chat history
    if (!req.user || uid !== req.user.uid) {
      return handleResponse(res, 403, { error: 'Unauthorized to clear chat history' });
    }

    const chatRef = db.collection("chats");
const query = chatRef
  .where("uid", "==", uid)
  .orderBy("timestamp", "desc")
  .orderBy("__name__", "desc");

const chatDocs = await query.get();
    // Delete all messages in batches
    const batch = db.batch();
    chatDocs.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    handleResponse(res, 200, { message: 'Chat history cleared successfully' });
  } catch (error) {
    console.error("Error clearing chat history:", error);
    handleError(res, error);
  }
});

module.exports = router;
// controllers/chatController.js
const { admin, db } = require("../config/firebase");
const { sendMessageToGemini, handleResponse, handleError } = require("../utils/apiHelpers");

// Handle chat messages
exports.handleChat = async (req, res) => {
  try {
    console.log("Chat handler received request");
    const userId = req.user?.uid || req.ip;
    const { message } = req.body;

    console.log(`Processing message from user ${userId}: ${message}`);

    // Validate input
    if (!message || typeof message !== "string") {
      console.log("Invalid input detected");
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
      console.log("Identity question detected");
      const botResponse = "I'm Budd, your intelligent emotional companion. How can I assist you today?";

      // Save conversation
      try {
        await Promise.all([
          db.collection("chats").add({
            uid: userId,
            message,
            sender: "user",
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
          }),
          db.collection("chats").add({
            uid: userId,
            message: botResponse,
            sender: "ai",
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
          }),
        ]);
        console.log("Identity conversation saved to Firestore");
      } catch (dbError) {
        console.error("Error saving to Firestore:", dbError);
        // Continue even if DB save fails
      }

      return res.json({
        success: true,
        message: botResponse,
      });
    }

    console.log("Getting chat history for context");
    // Get chat history for context
    let history = [];
    try {
      const chatHistory = await db
        .collection("chats")
        .where("uid", "==", userId)
        .orderBy("timestamp", "desc")
        .limit(5)
        .get();

      // Format history properly
      history = chatHistory.docs
        .map((doc) => ({
          message: doc.data().message,
          sender: doc.data().sender,
          timestamp: doc.data().timestamp,
        }))
        .reverse();
      
      console.log(`Retrieved ${history.length} chat history items`);
    } catch (historyError) {
      console.error("Error getting chat history:", historyError);
      // Continue with empty history if retrieval fails
    }

    console.log("Sending to Gemini API");
    // Call Gemini API for response
    const aiResponse = await sendMessageToGemini(message);
    console.log("Received response from Gemini API");

    // Save messages
    try {
      await Promise.all([
        db.collection("chats").add({
          uid: userId,
          message,
          sender: "user",
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        }),
        db.collection("chats").add({
          uid: userId,
          message: aiResponse,
          sender: "ai",
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        }),
      ]);
      console.log("Conversation saved to Firestore");
    } catch (dbError) {
      console.error("Error saving to Firestore:", dbError);
      // Continue even if DB save fails
    }

    console.log("Sending successful response to client");
    return res.json({
      success: true,
      message: aiResponse,
    });
  } catch (error) {
    console.error("Error in chat handler:", error);
    return handleError(res, error);
  }
};

// Fetch chat history
exports.getChatHistory = async (req, res) => {
  try {
    console.log("Getting chat history");
    const { uid } = req.params;
    
    if (uid !== req.user.uid) {
      return handleResponse(res, 403, {
        success: false,
        error: "Unauthorized access to chat history",
      });
    }

    const chatRef = db.collection("chats").where("uid", "==", uid);
    const chatSnapshot = await chatRef.orderBy("timestamp", "asc").get();
    
    const chatData = chatSnapshot.docs.map((doc) => ({
      id: doc.id,
      sender: doc.data().sender,
      message: doc.data().message,
      timestamp: doc.data().timestamp?.toDate() || new Date(),
    }));

    console.log(`Retrieved ${chatData.length} messages for user ${uid}`);
    
    return handleResponse(res, 200, {
      success: true,
      data: chatData,
    });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return handleError(res, error);
  }
};
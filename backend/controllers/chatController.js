// controllers/chatController.js
const { admin, db } = require("../config/firebase");
const { sendMessageToGemini, handleResponse, handleError } = require("../utils/apiHelpers");

// Simple function to create more human-like responses
const createHumanLikeResponse = (userMessage) => {
  // Convert to lowercase for easier matching
  const messageLower = userMessage.toLowerCase();
  
  // Philosophical/wisdom topics
  if (messageLower.includes("letting go") || messageLower.includes("manifest")) {
    return "Yeah, there's something to that. Sometimes when you stop obsessing over what you want, it finds its way to you. Funny how that works.";
  }
  
  // Emotional states
  if (messageLower.includes("happy") || messageLower.includes("good") || messageLower.includes("great")) {
    return "That's awesome! Nothing better than when things are going well. What made you most proud today?";
  }
  
  if (messageLower.includes("sad") || messageLower.includes("down") || messageLower.includes("depressed")) {
    return "That's rough. Sometimes you just need to sit with those feelings for a bit. I'm here if you want to talk more about it.";
  }
  
  if (messageLower.includes("angry") || messageLower.includes("mad") || messageLower.includes("frustrated")) {
    return "I totally get why that would frustrate you. Need to vent more about it?";
  }
  
  if (messageLower.includes("anxious") || messageLower.includes("stressed") || messageLower.includes("worry")) {
    return "Deep breath. One thing at a time. What's the first tiny step you can take?";
  }
  
  // Greetings
  if (messageLower.match(/^(hi|hey|hello|howdy)/)) {
    return "Hey there! How's your day going?";
  }
  
  if (messageLower.includes("how are you")) {
    return "Doing pretty well! Just finished some work. What about you?";
  }
  
  // Default responses based on message length
  if (userMessage.length < 15) {
    return "Tell me more about that. What's on your mind today?";
  }
  
  // Random default responses for longer messages
  const defaultResponses = [
    "I get that. Been there myself. What do you think is your next move?",
    "Interesting way to look at it. Have you always felt that way?",
    "Yeah, that's a good point. Makes me think about my own experiences with that.",
    "Life's funny that way sometimes. What else is on your mind?",
    "I hear you. Sometimes just talking about it helps clear things up."
  ];
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
};

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
          db.collection("user_chats").add({  // Changed from "chats" to "user_chats"
            uid: userId,
            message,
            sender: "user",
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
          }),
          db.collection("user_chats").add({  // Changed from "chats" to "user_chats"
            uid: userId,
            message: botResponse,
            sender: "ai",
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
          }),
        ]);
        console.log("Identity conversation saved to Firestore");
      } catch (dbError) {
        console.error("Error saving to Firestore:", dbError);
        if (dbError.code === 9) { // FAILED_PRECONDITION (index error)
          return handleError(res, {
            status: 500,
            message: "Firestore index required. Please check Firebase Console for index creation instructions.",
          });
        }
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
        .collection("user_chats")  // Changed from "chats" to "user_chats"
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
      if (historyError.code === 9) {
        return handleError(res, {
          status: 500,
          message: "Firestore index required. Please check Firebase Console for index creation instructions.",
        });
      }
      // Continue with empty history if retrieval fails
    }

    console.log("Generating response");
    
    // Option 1: Use the direct human-like response function (faster and more reliable)
    const aiResponse = createHumanLikeResponse(message);
    
    // Option 2: Uncomment this section if you want to try the Gemini API with strict brevity
    // (but this has been less reliable in providing concise responses)
    /*
    try {
      const aiResponse = await sendMessageToGemini(message);
      console.log("Received response from Gemini API");
    } catch (apiError) {
      console.error("Error with Gemini API, using fallback response:", apiError);
      const aiResponse = createHumanLikeResponse(message);
    }
    */

    // Save messages
    try {
      await Promise.all([
        db.collection("user_chats").add({  // Changed from "chats" to "user_chats"
          uid: userId,
          message,
          sender: "user",
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        }),
        db.collection("user_chats").add({  // Changed from "chats" to "user_chats"
          uid: userId,
          message: aiResponse,
          sender: "ai",
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        }),
      ]);
      console.log("Conversation saved to Firestore");
    } catch (dbError) {
      console.error("Error saving to Firestore:", dbError);
      if (dbError.code === 9) { // FAILED_PRECONDITION (index error)
        return handleError(res, {
          status: 500,
          message: "Firestore index required. Please check Firebase Console for index creation instructions.",
        });
      }
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

    const chatRef = db.collection("user_chats").where("uid", "==", uid);  
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
    if (error.code === 9) {
      return handleError(res, {
        status: 500,
        message: "Firestore index required. Please check Firebase Console for index creation instructions.",
      });
    }
    return handleError(res, error);
  }
};
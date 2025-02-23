const express = require("express");
const router = express.Router();
const { admin, db } = require("../config/firebase");
const { analyzeEmotion } = require("../services/emotionAnalysis");
const { generateResponse } = require("../services/aiResponse");
const { handleResponse, handleError } = require("../utils/apiHelpers");

// Verify UID middleware
const verifyUid = (req, res, next) => {
  const { uid } = req.params;
  if (uid !== req.user.uid) {
    return handleResponse(res, 403, { 
      success: false, 
      error: "Unauthorized access" 
    });
  }
  next();
};

// Main chat endpoint
router.post("/", async (req, res) => {
  try {
    const { message, uid } = req.body;
    if (!message) {
      return handleResponse(res, 400, { 
        success: false, 
        error: 'Message is required' 
      });
    }

    // Check bot identity questions
    if (message.toLowerCase().includes("your name") || 
        message.toLowerCase().includes("who are you")) {
      const botResponse = "I'm Budd, your intelligent emotional companion. How can I assist you today?";
      
      // Save conversation
      await Promise.all([
        db.collection("chats").add({
          uid,
          message,
          sender: 'user',
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        }),
        db.collection("chats").add({
          uid,
          message: botResponse,
          sender: 'ai',
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        })
      ]);

      return handleResponse(res, 200, {
        success: true,
        aiResponse: botResponse
      });
    }

   // Get chat history for context
   const chatHistory = await db.collection("chats")
   .where("uid", "==", uid)
   .orderBy("timestamp", "desc")
   .limit(5)
   .get();

 // Format history properly
 const history = chatHistory.docs
   .map(doc => ({
     message: doc.data().message,
     sender: doc.data().sender,
     timestamp: doc.data().timestamp
   }))
   .reverse();

 try {
   // Analyze emotion and generate response
   const [emotion, aiResponse] = await Promise.all([
     analyzeEmotion(message),
     generateResponse(message, { dominantEmotion: 'neutral' }, history || [])
   ]);

   // Save messages
   await Promise.all([
     db.collection("chats").add({
       uid,
       message,
       sender: 'user',
       emotion: emotion.dominantEmotion,
       timestamp: admin.firestore.FieldValue.serverTimestamp()
     }),
     db.collection("chats").add({
       uid,
       message: aiResponse,
       sender: 'ai',
       timestamp: admin.firestore.FieldValue.serverTimestamp()
     })
   ]);

   handleResponse(res, 200, {
     success: true,
     message: aiResponse,
     emotion: emotion.dominantEmotion
   });
 } catch (apiError) {
   // Handle API quota errors
   if (apiError.message?.includes('RESOURCE_EXHAUSTED') || 
       apiError.message?.includes('quota') || 
       apiError.message?.includes('rate limit')) {
     
     const resetTime = new Date();
     resetTime.setHours(24, 0, 0, 0);

     return handleResponse(res, 429, {
       success: false,
       error: 'Free messaging limit reached',
       resetTime: resetTime.toISOString(),
       message: 'The free messaging tier has been exhausted. Services will reset at midnight Pacific Time.'
     });
   }
   throw apiError;
 }
} catch (error) {
 console.error("Chat error:", error);
 handleError(res, error);
}
});

// Chat history endpoint
router.get("/chat-history/:uid", verifyUid, async (req, res) => {
  try {
    const { uid } = req.params;
    
    const chats = await db.collection("chats")
      .where("uid", "==", uid)
      .orderBy("timestamp", "desc")
      .limit(50)
      .get();

    const chatHistory = chats.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp ? doc.data().timestamp.toDate() : null
    }));

    handleResponse(res, 200, {
      success: true,
      data: chatHistory
    });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    handleError(res, error);
  }
});

// Delete chat message endpoint
router.delete("/message/:messageId", verifyUid, async (req, res) => {
  try {
    const { messageId } = req.params;
    const uid = req.user.uid;

    const messageRef = db.collection("chats").doc(messageId);
    const message = await messageRef.get();

    if (!message.exists) {
      return handleResponse(res, 404, { 
        success: false, 
        error: 'Message not found' 
      });
    }

    if (message.data().uid !== uid) {
      return handleResponse(res, 403, { 
        success: false, 
        error: 'Unauthorized to delete this message' 
      });
    }

    await messageRef.delete();
    handleResponse(res, 200, { 
      success: true,
      message: 'Message deleted successfully' 
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    handleError(res, error);
  }
});

// Clear chat history endpoint
router.delete("/clear-history/:uid", verifyUid, async (req, res) => {
  try {
    const { uid } = req.params;
    
    const chatRef = db.collection("chats");
    const query = chatRef
      .where("uid", "==", uid)
      .orderBy("timestamp", "desc");

    const chatDocs = await query.get();
    
    const batch = db.batch();
    chatDocs.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    handleResponse(res, 200, { 
      success: true,
      message: 'Chat history cleared successfully' 
    });
  } catch (error) {
    console.error("Error clearing chat history:", error);
    handleError(res, error);
  }
});

module.exports = router;
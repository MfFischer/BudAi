const express = require('express');
const router = express.Router();
const { handleResponse, handleError } = require('../utils/apiHelpers');
const chatController = require('../controllers/chatController'); // This should match your actual file name
const { db } = require('../config/firebase');

// Verify UID middleware
const verifyUid = (req, res, next) => {
  const { uid } = req.params;
  
  if (!req.user) {
    return handleResponse(res, 401, {
      success: false,
      error: "User not authenticated"
    });
  }
  
  if (uid !== req.user.uid) {
    return handleResponse(res, 403, {
      success: false,
      error: "Unauthorized access"
    });
  }
  
  next();
};

// Debug middleware
router.use((req, res, next) => {
  console.log(`Chat route: ${req.method} ${req.path}`);
  next();
});

// Main chat endpoint
router.post('/', (req, res) => {
  console.log('Chat endpoint called');
  
  // Check if the controller and handler exist
  if (!chatController || typeof chatController.handleChat !== 'function') {
    console.error('Chat controller or handler function is missing');
    return handleResponse(res, 500, {
      success: false,
      error: "Server configuration error"
    });
  }
  
  // Call the controller
  return chatController.handleChat(req, res);
});

// Chat history endpoint
router.get('/chat-history/:uid', verifyUid, (req, res) => {
  // Check if the controller and handler exist
  if (!chatController || typeof chatController.getChatHistory !== 'function') {
    console.error('Chat controller or getChatHistory function is missing');
    return handleResponse(res, 500, {
      success: false,
      error: "Server configuration error"
    });
  }
  
  // Call the controller
  return chatController.getChatHistory(req, res);
});

// Delete chat message endpoint
router.delete('/message/:messageId', verifyUid, async (req, res) => {
  try {
    const { messageId } = req.params;
    const uid = req.user.uid;

    const messageRef = db.collection('chats').doc(messageId);
    const message = await messageRef.get();

    if (!message.exists) {
      return handleResponse(res, 404, {
        success: false,
        error: "Message not found"
      });
    }

    if (message.data().uid !== uid) {
      return handleResponse(res, 403, {
        success: false,
        error: "Unauthorized to delete this message"
      });
    }

    await messageRef.delete();
    return handleResponse(res, 200, {
      success: true,
      message: "Message deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    return handleError(res, error);
  }
});

// Clear chat history endpoint
router.delete('/clear-history/:uid', verifyUid, async (req, res) => {
  try {
    const { uid } = req.params;

    const chatRef = db.collection('chats');
    const query = chatRef.where('uid', '==', uid).orderBy('timestamp', 'desc');

    const chatDocs = await query.get();

    const batch = db.batch();
    chatDocs.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    return handleResponse(res, 200, {
      success: true,
      message: "Chat history cleared successfully"
    });
  } catch (error) {
    console.error("Error clearing chat history:", error);
    return handleError(res, error);
  }
});

// Export the router
module.exports = router;
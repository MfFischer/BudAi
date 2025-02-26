const express = require("express");
const router = express.Router();
const { handleResponse, handleError } = require("../utils/apiHelpers");
const chatController = require("../controllers/chatController");

// Verify UID middleware
const verifyUid = (req, res, next) => {
  const { uid } = req.params;
  if (uid !== req.user.uid) {
    return handleResponse(res, 403, {
      success: false,
      error: "Unauthorized access",
    });
  }
  next();
};

// Main chat endpoint
router.post("/", chatController.handleChat);

// Chat history endpoint
router.get("/chat-history/:uid", verifyUid, chatController.getChatHistory);

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
        error: "Message not found",
      });
    }

    if (message.data().uid !== uid) {
      return handleResponse(res, 403, {
        success: false,
        error: "Unauthorized to delete this message",
      });
    }

    await messageRef.delete();
    handleResponse(res, 200, {
      success: true,
      message: "Message deleted successfully",
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
    const query = chatRef.where("uid", "==", uid).orderBy("timestamp", "desc");

    const chatDocs = await query.get();

    const batch = db.batch();
    chatDocs.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    handleResponse(res, 200, {
      success: true,
      message: "Chat history cleared successfully",
    });
  } catch (error) {
    console.error("Error clearing chat history:", error);
    handleError(res, error);
  }
});

module.exports = router;
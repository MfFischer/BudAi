const express = require("express");
const router = express.Router();
const { admin, db } = require("../config/firebase");

// Get profile
router.get("/", async (req, res) => {
  try {
    console.log("Getting profile for user:", req.user.uid);
    
    const userDoc = await db.collection("users").doc(req.user.uid).get();
    
    if (!userDoc.exists) {
      // Create default profile if none exists
      const defaultProfile = {
        name: "",
        age: "",
        language: "English",
        conversationStyle: "empathetic",
        notificationPreference: "daily",
        avatar: null,
        marketingConsent: false,
        analyticsConsent: false,
        dataRetentionPeriod: "30days",
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await db.collection("users").doc(req.user.uid).set(defaultProfile);
      console.log("Created default profile for:", req.user.uid);
      
      return res.json({
        success: true,
        data: defaultProfile
      });
    }

    console.log("Found existing profile");
    res.json({
      success: true,
      data: userDoc.data()
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Update profile
router.put("/", async (req, res) => {
  try {
    console.log("Updating profile for user:", req.user.uid);
    const {
      name,
      age,
      language,
      avatar,
      conversationStyle,
      notificationPreference,
      marketingConsent,
      analyticsConsent,
      dataRetentionPeriod
    } = req.body;

    const updateData = {
      name,
      age,
      language,
      avatar,
      conversationStyle,
      notificationPreference,
      marketingConsent,
      analyticsConsent,
      dataRetentionPeriod,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Optional: Add validation for avatar size
    if (avatar && avatar.length > 5000000) { // 5MB limit
      return res.status(400).json({
        success: false,
        error: "Avatar image is too large. Please choose a smaller image."
      });
    }

    await db.collection("users").doc(req.user.uid).set(updateData, { merge: true });
    console.log("Profile updated successfully");
    
    res.json({
      success: true,
      data: updateData,
      message: "Profile updated successfully"
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Export data endpoint
router.get("/export", async (req, res) => {
  try {
    const userDoc = await db.collection("users").doc(req.user.uid).get();
    const userData = userDoc.data();

    // Get user's chat history
    const chats = await db.collection("chats")
      .where("uid", "==", req.user.uid)
      .orderBy("timestamp", "desc")
      .get();

    const chatHistory = chats.docs.map(doc => ({
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate()
    }));

    const exportData = {
      profile: userData,
      chatHistory: chatHistory
    };

    res.json({
      success: true,
      data: exportData
    });
  } catch (error) {
    console.error("Error exporting data:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to export data" 
    });
  }
});

// Delete data endpoint
router.delete("/data", async (req, res) => {
  try {
    // Delete user profile
    await db.collection("users").doc(req.user.uid).delete();

    // Delete chat history
    const chats = await db.collection("chats")
      .where("uid", "==", req.user.uid)
      .get();

    const batch = db.batch();
    chats.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    res.json({
      success: true,
      message: "All user data deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting data:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to delete data" 
    });
  }
});

module.exports = router;
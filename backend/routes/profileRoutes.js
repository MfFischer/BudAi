// backend/routes/profileRoutes.js
const express = require("express");
const router = express.Router();
const { admin, db } = require("../config/firebase");

// Verify Firebase token middleware
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get profile
router.get("/", verifyToken, async (req, res) => {
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
        avatar: null, // Add default avatar field
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await db.collection("users").doc(req.user.uid).set(defaultProfile);
      console.log("Created default profile for:", req.user.uid);
      return res.json(defaultProfile);
    }

    console.log("Found existing profile");
    res.json(userDoc.data());
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update profile
router.put("/", verifyToken, async (req, res) => {
  try {
    console.log("Updating profile for user:", req.user.uid);
    const { 
      name, 
      age, 
      language, 
      conversationStyle, 
      notificationPreference,
      avatar  // Add avatar to destructuring
    } = req.body;
    
    const updateData = {
      name,
      age,
      language,
      conversationStyle,
      notificationPreference,
      avatar,  // Add avatar to updateData
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Optional: Add validation for avatar size
    if (avatar && avatar.length > 5000000) { // 5MB limit
      return res.status(400).json({ 
        error: "Avatar image is too large. Please choose a smaller image." 
      });
    }

    await db.collection("users").doc(req.user.uid).set(updateData, { merge: true });
    console.log("Profile updated successfully");
    
    res.json({ 
      message: "Profile updated successfully",
      data: updateData
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
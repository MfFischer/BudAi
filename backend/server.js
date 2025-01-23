const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_KEY))
});

const db = admin.firestore();
const app = express();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(limiter);

// Auth middleware
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) throw new Error('No token provided');
    
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// User routes
app.post("/api/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const userRecord = await admin.auth().createUser({ email, password, displayName: name });
    await db.collection("users").doc(userRecord.uid).set({
      name,
      email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      settings: {
        language: 'en',
        notificationPreference: 'daily',
        theme: 'dark'
      }
    });

    res.status(201).json({ message: "User created successfully", uid: userRecord.uid });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Profile routes
app.put("/api/profile", authenticateUser, async (req, res) => {
  try {
    const { name, age, language, settings } = req.body;
    const updates = {
      ...(name && { name }),
      ...(age && { age }),
      ...(language && { language }),
      ...(settings && { settings }),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection("users").doc(req.user.uid).update(updates);
    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/api/profile", authenticateUser, async (req, res) => {
  try {
    const userDoc = await db.collection("users").doc(req.user.uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(userDoc.data());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Chat routes
app.post("/api/chat", authenticateUser, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Save user message
    const chatRef = await db.collection("chats").add({
      uid: req.user.uid,
      message,
      sender: 'user',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    // Get AI response
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(message);
    const aiMessage = result.response.text();

    // Save AI response
    await db.collection("chats").add({
      uid: req.user.uid,
      message: aiMessage,
      sender: 'ai',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ 
      userMessageId: chatRef.id,
      aiResponse: aiMessage 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/api/chat", authenticateUser, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const chats = await db.collection("chats")
      .where("uid", "==", req.user.uid)
      .orderBy("timestamp", "desc")
      .limit(limit)
      .get();

    const chatHistory = chats.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?._seconds || null
    }));

    res.json(chatHistory.reverse());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Activities routes
app.get("/api/activities", authenticateUser, async (req, res) => {
  try {
    const activities = await db.collection("activities")
      .where("uid", "==", req.user.uid)
      .orderBy("createdAt", "desc")
      .get();

    res.json(activities.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/activities", authenticateUser, async (req, res) => {
  try {
    const { type, data } = req.body;
    if (!type || !data) {
      return res.status(400).json({ error: 'Type and data are required' });
    }

    const activity = {
      uid: req.user.uid,
      type,
      data,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const activityRef = await db.collection("activities").add(activity);
    res.status(201).json({ 
      message: "Activity saved successfully",
      id: activityRef.id 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
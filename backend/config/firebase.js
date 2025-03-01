// backend/config/firebase.js
require('dotenv').config(); // Load .env file

const admin = require("firebase-admin");
const path = require("path");

function getFirebaseAdmin() {
  if (!admin.apps.length) {
    try {
      let serviceAccount;

      // Use environment variable for service account key (Heroku or local .env)
      if (process.env.FIREBASE_CREDENTIALS) {
        try {
          serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
        } catch (parseError) {
          console.error("Error parsing FIREBASE_CREDENTIALS environment variable:", parseError);
          throw new Error("Invalid Firebase service account JSON in FIREBASE_CREDENTIALS");
        }
      } else {
        // Fallback to local file for development (ensure firebase-key.json is in .gitignore)
        try {
          serviceAccount = require(path.join(__dirname, "../firebase-key.json"));
        } catch (fileError) {
          console.error("Error loading firebase-key.json locally:", fileError);
          throw new Error("Firebase service account key not found. Set FIREBASE_CREDENTIALS or provide firebase-key.json for local development.");
        }
      } // <- Added the missing closing brace here

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        //databaseURL: process.env.FIREBASE_DATABASE_URL || "https://budai-ef5fa.firebaseio.com" // Replace with your Firebase Realtime Database URL
      });

      console.log("Firebase initialized successfully");
    } catch (error) {
      console.error("Error initializing Firebase Admin SDK:", error);
      throw error;
    }
  } else {
    console.log("Firebase already initialized");
  }
  return admin;
}

const firebaseAdmin = getFirebaseAdmin();
const db = firebaseAdmin.firestore();

// Test Firestore connection (optional, comment out in production or Heroku)
const testFirestore = async () => {
  if (process.env.NODE_ENV !== "production") {
    try {
      const docRef = db.collection("test").doc("testDoc");
      await docRef.set({ 
        message: "Firestore is working!", 
        timestamp: admin.firestore.FieldValue.serverTimestamp() 
      });
      console.log("Firestore test document written successfully");
    } catch (error) {
      console.error("Error accessing Firestore:", error);
    }
  }
};

// Run test only in development (not on Heroku or production)
if (process.env.NODE_ENV !== "production") {
  testFirestore();
}

module.exports = { admin: firebaseAdmin, db };
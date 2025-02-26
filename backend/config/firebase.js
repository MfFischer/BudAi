const admin = require("firebase-admin");
const path = require("path");

function getFirebaseAdmin() {
  if (!admin.apps.length) {
    try {
      const serviceAccount = require(path.join(__dirname, "../firebase-key.json"));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("Firebase initialized successfully");
    } catch (error) {
      console.error("Error initializing Firebase Admin SDK:", error);
      throw error; // Rethrow to catch initialization issues early
    }
  } else {
    console.log("Firebase already initialized");
  }
  return admin;
}

const firebaseAdmin = getFirebaseAdmin();
const db = firebaseAdmin.firestore();

// Test Firestore connection (optional, comment out in production)
const testFirestore = async () => {
  try {
    const docRef = db.collection("test").doc("testDoc");
    await docRef.set({ message: "Firestore is working!", timestamp: admin.firestore.FieldValue.serverTimestamp() });
    console.log("Firestore test document written successfully");
  } catch (error) {
    console.error("Error accessing Firestore:", error);
  }
};

// Only run test in development (optional)
if (process.env.NODE_ENV !== "production") {
  testFirestore();
}

module.exports = { admin: firebaseAdmin, db };
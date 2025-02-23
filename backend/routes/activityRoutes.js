const express = require("express");
const router = express.Router();
const { db } = require("../config/firebase");
const { getActivitySuggestions, submitJournalEntry } = require("../controllers/activityController");

// Verify UID middleware
const verifyUid = (req, res, next) => {
  const { uid } = req.params;
  if (uid !== req.user.uid) {
    return res.status(403).json({
      success: false,
      error: "Unauthorized access"
    });
  }
  next();
};

// Activity suggestions route
router.get("/suggestions/:uid", verifyUid, getActivitySuggestions);

// Submit journal entry route
router.post("/journal/:uid", verifyUid, submitJournalEntry);

// Get journal entries route
router.get("/journal/:uid", verifyUid, async (req, res) => {
  try {
    const { uid } = req.params;
    const entries = await db.collection('journal_entries')
      .where('uid', '==', uid)
      .orderBy('timestamp', 'desc')
      .get();

    res.json({
      success: true,
      data: entries.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      }))
    });
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch journal entries" 
    });
  }
});

module.exports = router;
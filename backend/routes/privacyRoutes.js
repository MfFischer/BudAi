const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// Get user data
router.get('/user/data', auth, async (req, res) => {
  try {
    const userId = req.user.uid;
    const userData = await db.collection('users').doc(userId).get();
    const chatData = await db.collection('chats')
      .where('uid', '==', userId)
      .get();

    const data = {
      profile: userData.data(),
      chats: chatData.docs.map(doc => doc.data())
    };

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user data' });
  }
});

// Export user data
router.get('/user/export', auth, async (req, res) => {
  try {
    const userId = req.user.uid;
    const userData = await db.collection('users').doc(userId).get();
    const chatData = await db.collection('chats')
      .where('uid', '==', userId)
      .get();

    const exportData = {
      profile: userData.data(),
      chats: chatData.docs.map(doc => doc.data()),
      exportDate: new Date().toISOString()
    };

    res.json(exportData);
  } catch (error) {
    res.status(500).json({ error: 'Error exporting user data' });
  }
});

// Delete user data
router.delete('/user/data', auth, async (req, res) => {
  try {
    const userId = req.user.uid;
    
    // Delete user profile
    await db.collection('users').doc(userId).delete();
    
    // Delete user chats
    const chatDocs = await db.collection('chats')
      .where('uid', '==', userId)
      .get();
      
    const batch = db.batch();
    chatDocs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    res.json({ message: 'User data deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting user data' });
  }
});
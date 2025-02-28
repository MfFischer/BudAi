const { admin } = require('../config/firebase');

const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth middleware processing request');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No auth header or invalid format');
      return res.status(401).json({ 
        success: false,
        error: 'No token provided' 
      });
    }
    
    const token = authHeader.split('Bearer ')[1];
    console.log('Token found, verifying with Firebase...');
    
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      console.log('User authenticated:', decodedToken.uid);
      
      // Set both formats for compatibility
      req.user = decodedToken;
      req.user.id = decodedToken.uid; // Add id field for compatibility
      
      next();
    } catch (verifyError) {
      console.error('Token verification failed:', verifyError);
      return res.status(401).json({ 
        success: false,
        error: 'Invalid token',
        details: verifyError.message
      });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ 
      success: false,
      error: 'Authentication failed' 
    });
  }
};

module.exports = { authenticateUser };
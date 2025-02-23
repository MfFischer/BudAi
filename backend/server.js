require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { admin, db } = require('./config/firebase');

const app = express();

app.set('trust proxy', 1);

// Global rate limiter to prevent abuse
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { 
    success: false, 
    error: "Too many requests, please try again later." 
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));
app.use(globalLimiter);

// Routes
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const activityRoutes = require('./routes/activityRoutes');
const chatRoutes = require('./routes/chatRoutes');

// Authentication middleware
const verifyAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: "Authentication required" 
      });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    
    if (req.path.startsWith('/api/chat')) {
      req.body = { ...req.body, uid: decodedToken.uid };
    }
    
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ 
      success: false,
      error: "Authentication failed" 
    });
  }
};

// API Status endpoint
app.get('/api/status', verifyAuth, async (req, res) => {
  try {
    res.json({
      success: true,
      status: "operational",
      user: {
        uid: req.user.uid,
        email: req.user.email
      }
    });
  } catch (error) {
    console.error('Error getting API status:', error);
    res.status(500).json({ 
      success: false,
      error: "Failed to get API status" 
    });
  }
});

// Routes
app.use('/api/chat', verifyAuth, chatRoutes);
app.use('/api/activities', verifyAuth, activityRoutes);
app.use('/api/profile', verifyAuth, profileRoutes);
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error details:', err);
  
  // Handle Gemini API quota errors
  if (err.message?.includes('RESOURCE_EXHAUSTED') || 
      err.message?.includes('quota') || 
      err.message?.includes('rate limit')) {
    
    const resetTime = new Date();
    resetTime.setHours(24, 0, 0, 0); // Reset at midnight

    return res.status(429).json({
      success: false,
      error: 'Free messaging limit reached',
      resetTime: resetTime.toISOString(),
      message: 'The free messaging tier has been exhausted. Services will reset at midnight Pacific Time.'
    });
  }

  // Handle other errors
  res.status(err.status || 500).json({ 
    success: false,
    error: err.message || 'Something went wrong!'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
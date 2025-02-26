require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const helmet = require('helmet');
const NodeCache = require('node-cache');
const { admin, db } = require('./config/firebase');

const app = express();
const apiUsageCache = new NodeCache({ stdTTL: 86400 }); // Cache expires after 24 hours

// Validate required environment variables
const requiredEnvVars = ['FRONTEND_URL', 'GEMINI_API_KEY']; // Removed PORT, handled below
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

app.set('trust proxy', 1);

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    error: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL, // Use Heroku/Firebase URL, no fallback to localhost
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(morgan('combined'));
app.use(helmet());
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
        error: "Authentication required",
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
      error: "Authentication failed",
    });
  }
};

// Track API usage
const trackApiUsage = (req, res, next) => {
  const today = new Date().toISOString().split('T')[0];
  const usage = apiUsageCache.get(today) || 0;

  if (usage >= 100) { // 100 requests/day limit
    return res.status(429).json({
      success: false,
      error: 'Free messaging limit reached',
      resetTime: getResetTime(),
      message: 'The free messaging tier has been exhausted. Services will reset at midnight Pacific Time.',
    });
  }

  apiUsageCache.set(today, usage + 1);
  next();
};

// Calculate reset time
const getResetTime = () => {
  const now = new Date();
  const resetTime = new Date(now);
  resetTime.setHours(24, 0, 0, 0); // Midnight next day
  return resetTime.toISOString();
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// API Status endpoint
app.get('/api/status', verifyAuth, async (req, res) => {
  try {
    res.json({
      success: true,
      status: "operational",
      user: {
        uid: req.user.uid,
        email: req.user.email,
      },
    });
  } catch (error) {
    console.error('Error getting API status:', error);
    res.status(500).json({
      success: false,
      error: "Failed to get API status",
    });
  }
});

// Protected routes
app.use('/api/chat', verifyAuth, trackApiUsage, chatRoutes);
app.use('/api/activities', verifyAuth, activityRoutes);
app.use('/api/profile', verifyAuth, profileRoutes);
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error details:', err);

  if (err.message?.includes('RESOURCE_EXHAUSTED') ||
      err.message?.includes('quota') ||
      err.message?.includes('rate limit')) {
    return res.status(429).json({
      success: false,
      error: 'Free messaging limit reached',
      resetTime: getResetTime(),
      message: 'The free messaging tier has been exhausted. Services will reset at midnight Pacific Time.',
    });
  }

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Something went wrong!',
  });
});

// Start server with Heroku-compatible port
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

module.exports = app;
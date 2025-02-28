require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const helmet = require('helmet');
const NodeCache = require('node-cache');
const { admin, db } = require('./config/firebase');
const { authenticateUser } = require('./middleware/auth');

const app = express();
const apiUsageCache = new NodeCache({ stdTTL: 86400 }); // Cache expires after 24 hours

// Validate environment variables with better fallbacks for local development
const requiredEnvVars = ['GEMINI_API_KEY'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Default frontend URL for local development
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
console.log(`Using frontend URL: ${FRONTEND_URL}`);

app.set('trust proxy', 1);

// Global rate limiter - less strict for local development
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Increased for development
  message: {
    success: false,
    error: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',         // Local development
    'https://budai-ef5fa.web.app',   // Your Firebase production URL
    'https://budai-ef5fa.firebaseapp.com', // Alternative Firebase domain
    FRONTEND_URL                     // From environment variable
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(morgan('dev')); // More concise logs for development
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for simplicity in development
  crossOriginEmbedderPolicy: false // Allow embedding for Firebase apps
}));
app.use(globalLimiter);

// Safely load route modules with error handling
const loadRoute = (path) => {
  try {
    const route = require(path);
    if (typeof route !== 'function') {
      console.error(`Warning: The route module at ${path} does not export a router function`);
      console.error(`Type received: ${typeof route}`);
      // Return a dummy router that reports the configuration error
      const dummyRouter = express.Router();
      dummyRouter.all('*', (req, res) => {
        res.status(500).json({
          success: false,
          error: `Route configuration error in ${path}`
        });
      });
      return dummyRouter;
    }
    return route;
  } catch (error) {
    console.error(`Error loading route ${path}:`, error);
    // Return a dummy router that reports the error
    const dummyRouter = express.Router();
    dummyRouter.all('*', (req, res) => {
      res.status(500).json({
        success: false,
        error: `Failed to load route module: ${path}`
      });
    });
    return dummyRouter;
  }
};

// Load routes with error handling
console.log("Loading route modules...");
let chatRoutes, profileRoutes, activityRoutes, authRoutes;

try {
  chatRoutes = require('./routes/chatRoutes');
  console.log("Chat routes loaded successfully");
} catch (error) {
  console.error("Failed to load chat routes:", error);
  chatRoutes = express.Router();
  chatRoutes.all('*', (req, res) => {
    res.status(500).json({
      success: false,
      error: "Chat routes failed to load"
    });
  });
}

try {
  profileRoutes = require('./routes/profileRoutes');
  console.log("Profile routes loaded successfully");
} catch (error) {
  console.error("Failed to load profile routes:", error);
  profileRoutes = express.Router();
}

try {
  activityRoutes = require('./routes/activityRoutes');
  console.log("Activity routes loaded successfully");
} catch (error) {
  console.error("Failed to load activity routes:", error);
  activityRoutes = express.Router();
}

try {
  authRoutes = require('./routes/authRoutes');
  console.log("Auth routes loaded successfully");
} catch (error) {
  console.error("Failed to load auth routes:", error);
  authRoutes = express.Router();
}

// Track API usage - simplified for local development
const trackApiUsage = (req, res, next) => {
  // Skip tracking for local development if needed
  if (process.env.NODE_ENV === 'development') {
    return next();
  }
  
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

// Debug middleware to log requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  if (req.method === 'POST') {
    console.log('Request body:', req.body);
  }
  console.log('Headers:', req.headers.authorization ? 'Auth header present' : 'No auth header');
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// API Status endpoint
app.get('/api/status', authenticateUser, async (req, res) => {
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

// Protected routes - using authenticateUser from middleware/auth.js
app.use('/api/chat', authenticateUser, trackApiUsage, chatRoutes);
app.use('/api/activities', authenticateUser, activityRoutes);
app.use('/api/profile', authenticateUser, profileRoutes);
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
const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
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
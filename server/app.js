// ============================================
// MES Application - Express App Configuration
// ============================================
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// ---------------------
// Security Middleware
// ---------------------
app.use(helmet());
app.use(cors({
  origin: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

// ---------------------
// Rate Limiting
// ---------------------
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: 'Too many requests, please try again later.' },
  },
});
app.use('/api', limiter);

// ---------------------
// Body Parsing
// ---------------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ---------------------
// Request Logging
// ---------------------
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ---------------------
// API Routes
// ---------------------
app.use('/api', routes);

// ---------------------
// 404 Handler
// ---------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { message: `Route ${req.originalUrl} not found` },
  });
});

// ---------------------
// Global Error Handler
// ---------------------
app.use(errorHandler);

module.exports = app;

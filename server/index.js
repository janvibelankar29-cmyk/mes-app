// ============================================
// MES Application - Server Entry Point
// ============================================
require('dotenv').config();

const http = require('http');
const app = require('./app');
const { testConnection } = require('./config/db');
const { initializeSocket } = require('./sockets');

const PORT = parseInt(process.env.PORT, 10) || 5000;

// Create HTTP server (needed for Socket.io)
const server = http.createServer(app);

let io;

// ---------------------
// Graceful Shutdown
// ---------------------
const shutdown = async (signal) => {
  console.log(`\n[Server] ${signal} received. Shutting down gracefully...`);

  // Close Socket.io connections
  if (io) {
    io.close(() => {
      console.log('[Socket.io] All connections closed');
    });
  }

  // Close HTTP server
  server.close(() => {
    console.log('[Server] HTTP server closed');
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('[Server] Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// ---------------------
// Start Server
// ---------------------
const start = async () => {
  // Initialize Socket.io
  io = await initializeSocket(server);

  // Make io accessible in request handlers via app.locals
  app.locals.io = io;

  // Test DB connection (non-blocking – server starts even if DB is down)
  const dbOk = await testConnection();
  if (!dbOk) {
    console.warn('[Server] ⚠ Database is unreachable. Server will start, but DB-dependent routes will fail.');
  }

  server.listen(PORT, () => {
    console.log('');
    console.log('=========================================');
    console.log('  MES Application Server');
    console.log('=========================================');
    console.log(`  Environment : ${process.env.NODE_ENV || 'development'}`);
    console.log(`  Port        : ${PORT}`);
    console.log(`  Database    : ${dbOk ? '✓ Connected' : '✗ Disconnected'}`);
    console.log(`  Socket.io   : ✓ Active`);
    console.log(`  Health      : http://localhost:${PORT}/api/health`);
    console.log('=========================================');
    console.log('');
  });
};

start().catch((err) => {
  console.error('[Server] Failed to start:', err);
  process.exit(1);
});

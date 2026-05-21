// ============================================
// MES Application - Socket.io Setup
// ============================================
const { Server } = require('socket.io');

const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');

/**
 * Initialize Socket.io on the HTTP server.
 * @param {import('http').Server} httpServer
 * @returns {Promise<import('socket.io').Server>}
 */
const initializeSocket = async (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
    pingInterval: 25000,
    pingTimeout: 60000,
  });

  // Setup Redis Adapter for scalability (if REDIS_URL is provided)
  if (process.env.REDIS_URL) {
    try {
      const pubClient = createClient({ url: process.env.REDIS_URL });
      const subClient = pubClient.duplicate();

      await Promise.all([pubClient.connect(), subClient.connect()]);
      io.adapter(createAdapter(pubClient, subClient));
      console.log('[Socket.io] Redis adapter initialized for scalability');
    } catch (err) {
      console.error('[Socket.io] Redis adapter failed to initialize:', err.message);
    }
  }

  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Join room for specific machine updates
    socket.on('subscribe:machine', (machineId) => {
      socket.join(`machine:${machineId}`);
      console.log(`[Socket.io] ${socket.id} subscribed to machine:${machineId}`);
    });

    // Join room for production floor overview
    socket.on('subscribe:floor', () => {
      socket.join('floor:overview');
      console.log(`[Socket.io] ${socket.id} subscribed to floor:overview`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket.io] Client disconnected: ${socket.id} (${reason})`);
    });
  });

  console.log('[Socket.io] Initialized successfully');
  return io;
};

module.exports = { initializeSocket };

// ============================================
// MES Application - Health Controller
// ============================================
const { testConnection } = require('../config/db');

/**
 * GET /health
 * Returns server health status including DB connectivity.
 */
const getHealth = async (req, res) => {
  const dbConnected = await testConnection();
  const uptime = process.uptime();

  const status = dbConnected ? 'healthy' : 'degraded';
  const httpCode = dbConnected ? 200 : 503;

  res.status(httpCode).json({
    success: true,
    data: {
      status,
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(uptime)}s`,
      environment: process.env.NODE_ENV || 'development',
      version: require('../package.json').version || '1.0.0',
      services: {
        database: dbConnected ? 'connected' : 'disconnected',
        socketio: 'active',
      },
    },
  });
};

module.exports = { getHealth };

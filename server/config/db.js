// ============================================
// MES Application - Database Configuration
// ============================================
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: parseInt(process.env.DB_MAX_CONNECTIONS, 10) || 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Log pool errors to prevent unhandled rejections
pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client:', err.message);
});

/**
 * Execute a SQL query with optional parameters.
 * @param {string} text - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<import('pg').QueryResult>}
 */
const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log('[DB] Query executed', {
        text: text.substring(0, 80),
        duration: `${duration}ms`,
        rows: result.rowCount,
      });
    }
    return result;
  } catch (error) {
    console.error('[DB] Query error:', { text: text.substring(0, 80), error: error.message });
    throw error;
  }
};

/**
 * Get a client from the pool for transactions.
 * @returns {Promise<import('pg').PoolClient>}
 */
const getClient = async () => {
  const client = await pool.connect();
  return client;
};

/**
 * Test the database connection.
 * @returns {Promise<boolean>}
 */
const testConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW() AS current_time');
    console.log('[DB] Connection verified at:', result.rows[0].current_time);
    return true;
  } catch (error) {
    console.error('[DB] Connection failed:', error.message);
    return false;
  }
};

module.exports = { pool, query, getClient, testConnection };

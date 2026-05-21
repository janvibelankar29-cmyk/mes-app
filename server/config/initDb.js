// ============================================
// MES Application - Database Initializer
// ============================================
// Usage: node config/initDb.js
// This script creates all tables and seeds sample data.
// ============================================
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

const run = async () => {
  const client = await pool.connect();

  try {
    console.log('[InitDB] Connected to PostgreSQL');
    console.log(`[InitDB] Database: ${process.env.DB_NAME}`);
    console.log('');

    // --- Run schema ---
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    console.log('[InitDB] Running schema.sql ...');
    await client.query(schemaSql);
    console.log('[InitDB] ✓ Schema created successfully');

    // --- Run seed ---
    const seedPath = path.join(__dirname, 'seed.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf-8');
    console.log('[InitDB] Running seed.sql ...');
    await client.query(seedSql);
    console.log('[InitDB] ✓ Seed data inserted successfully');

    // --- Verify ---
    const tables = ['users', 'machines', 'work_orders', 'production_logs', 'downtime_logs'];
    console.log('');
    console.log('[InitDB] Table row counts:');
    for (const table of tables) {
      const res = await client.query(`SELECT COUNT(*)::int AS count FROM ${table}`);
      console.log(`  ${table.padEnd(20)} ${res.rows[0].count} rows`);
    }

    console.log('');
    console.log('[InitDB] ✓ Database initialization complete!');
  } catch (error) {
    console.error('[InitDB] ✗ Error:', error.message);
    if (error.detail) console.error('[InitDB]   Detail:', error.detail);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

run();

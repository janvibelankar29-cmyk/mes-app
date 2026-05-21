// ============================================
// MES Application - User Model
// ============================================
const { query } = require('../config/db');

const UserModel = {
  /**
   * Get all users (excludes password_hash).
   */
  async findAll() {
    const result = await query(
      `SELECT id, username, email, full_name, role, is_active, last_login, created_at, updated_at
       FROM users
       ORDER BY created_at DESC`
    );
    return result.rows;
  },

  /**
   * Get a single user by ID.
   */
  async findById(id) {
    const result = await query(
      `SELECT id, username, email, full_name, role, is_active, last_login, created_at, updated_at
       FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Get a single user by username (includes password_hash for auth).
   */
  async findByUsername(username) {
    const result = await query(
      `SELECT * FROM users WHERE username = $1`,
      [username]
    );
    return result.rows[0] || null;
  },

  /**
   * Get a single user by email (includes password_hash for auth).
   */
  async findByEmail(email) {
    const result = await query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );
    return result.rows[0] || null;
  },

  /**
   * Create a new user.
   */
  async create({ username, email, password_hash, full_name, role }) {
    const result = await query(
      `INSERT INTO users (username, email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, username, email, full_name, role, is_active, created_at`,
      [username, email, password_hash, full_name, role || 'operator']
    );
    return result.rows[0];
  },

  /**
   * Update user details.
   */
  async update(id, fields) {
    const allowed = ['full_name', 'email', 'role', 'is_active'];
    const sets = [];
    const values = [];
    let idx = 1;

    for (const key of allowed) {
      if (fields[key] !== undefined) {
        sets.push(`${key} = $${idx}`);
        values.push(fields[key]);
        idx++;
      }
    }
    if (sets.length === 0) return null;

    values.push(id);
    const result = await query(
      `UPDATE users SET ${sets.join(', ')} WHERE id = $${idx}
       RETURNING id, username, email, full_name, role, is_active, updated_at`,
      values
    );
    return result.rows[0] || null;
  },

  /**
   * Update last login timestamp.
   */
  async updateLastLogin(id) {
    await query(`UPDATE users SET last_login = NOW() WHERE id = $1`, [id]);
  },
};

module.exports = UserModel;

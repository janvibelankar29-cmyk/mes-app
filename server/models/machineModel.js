// ============================================
// MES Application - Machine Model
// ============================================
const { query } = require('../config/db');

const MachineModel = {
  /**
   * Get all machines, optionally filtered by status.
   */
  async findAll(filters = {}) {
    let sql = `SELECT * FROM machines`;
    const conditions = [];
    const values = [];
    let idx = 1;

    if (filters.status) {
      conditions.push(`status = $${idx++}`);
      values.push(filters.status);
    }
    if (filters.type) {
      conditions.push(`type = $${idx++}`);
      values.push(filters.type);
    }
    if (filters.location) {
      conditions.push(`location ILIKE $${idx++}`);
      values.push(`%${filters.location}%`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY machine_code ASC';

    const result = await query(sql, values);
    return result.rows;
  },

  /**
   * Get a single machine by ID.
   */
  async findById(id) {
    const result = await query(`SELECT * FROM machines WHERE id = $1`, [id]);
    return result.rows[0] || null;
  },

  /**
   * Get a single machine by machine_code.
   */
  async findByCode(code) {
    const result = await query(`SELECT * FROM machines WHERE machine_code = $1`, [code]);
    return result.rows[0] || null;
  },

  /**
   * Create a new machine.
   */
  async create({ machine_code, name, type, location, status, max_speed, description, installed_date }) {
    const result = await query(
      `INSERT INTO machines (machine_code, name, type, location, status, max_speed, description, installed_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [machine_code, name, type, location, status || 'idle', max_speed, description, installed_date]
    );
    return result.rows[0];
  },

  /**
   * Update machine status.
   */
  async updateStatus(id, status) {
    const result = await query(
      `UPDATE machines SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );
    return result.rows[0] || null;
  },

  /**
   * Update machine details.
   */
  async update(id, fields) {
    const allowed = ['name', 'type', 'location', 'status', 'max_speed', 'description', 'last_maintenance'];
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
      `UPDATE machines SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  },

  /**
   * Delete a machine.
   */
  async delete(id) {
    const result = await query(`DELETE FROM machines WHERE id = $1 RETURNING id`, [id]);
    return result.rowCount > 0;
  },

  /**
   * Get machine status summary (count by status).
   */
  async getStatusSummary() {
    const result = await query(
      `SELECT status, COUNT(*)::int AS count
       FROM machines
       GROUP BY status
       ORDER BY status`
    );
    return result.rows;
  },
};

module.exports = MachineModel;

// ============================================
// MES Application - Production Log Model
// ============================================
const { query } = require('../config/db');

const ProductionLogModel = {
  /**
   * Get all production logs with joined info.
   */
  async findAll(filters = {}) {
    let sql = `
      SELECT pl.*,
             m.name          AS machine_name,
             m.machine_code  AS machine_code,
             wo.order_number AS order_number,
             wo.product_name AS product_name,
             u.full_name     AS operator_name
      FROM production_logs pl
      JOIN machines m     ON pl.machine_id    = m.id
      JOIN work_orders wo ON pl.work_order_id = wo.id
      LEFT JOIN users u   ON pl.operator_id   = u.id`;

    const conditions = [];
    const values = [];
    let idx = 1;

    if (filters.machine_id) {
      conditions.push(`pl.machine_id = $${idx++}`);
      values.push(filters.machine_id);
    }
    if (filters.work_order_id) {
      conditions.push(`pl.work_order_id = $${idx++}`);
      values.push(filters.work_order_id);
    }
    if (filters.shift) {
      conditions.push(`pl.shift = $${idx++}`);
      values.push(filters.shift);
    }
    if (filters.start_date) {
      conditions.push(`pl.start_time >= $${idx++}`);
      values.push(filters.start_date);
    }
    if (filters.end_date) {
      conditions.push(`pl.end_time <= $${idx++}`);
      values.push(filters.end_date);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY pl.created_at DESC';

    const result = await query(sql, values);
    return result.rows;
  },

  /**
   * Get a single production log by ID.
   */
  async findById(id) {
    const result = await query(
      `SELECT pl.*,
              m.name          AS machine_name,
              wo.order_number AS order_number,
              u.full_name     AS operator_name
       FROM production_logs pl
       JOIN machines m     ON pl.machine_id    = m.id
       JOIN work_orders wo ON pl.work_order_id = wo.id
       LEFT JOIN users u   ON pl.operator_id   = u.id
       WHERE pl.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Create a production log entry and update work order totals.
   */
  async create(data) {
    const {
      work_order_id, machine_id, operator_id,
      quantity_produced, quantity_defect, cycle_time,
      shift, start_time, end_time, notes,
    } = data;

    // Insert the production log
    const result = await query(
      `INSERT INTO production_logs
         (work_order_id, machine_id, operator_id, quantity_produced,
          quantity_defect, cycle_time, shift, start_time, end_time, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        work_order_id, machine_id, operator_id,
        quantity_produced, quantity_defect || 0,
        cycle_time, shift || 'day', start_time, end_time, notes,
      ]
    );

    // Update work order running totals
    await query(
      `UPDATE work_orders
       SET quantity_produced = quantity_produced + $1,
           quantity_defect   = quantity_defect   + $2
       WHERE id = $3`,
      [quantity_produced, quantity_defect || 0, work_order_id]
    );

    return result.rows[0];
  },

  /**
   * Get daily production summary for a machine.
   */
  async getDailySummary(machineId, days = 7) {
    const result = await query(
      `SELECT
         DATE(start_time) AS date,
         SUM(quantity_produced)::int AS total_produced,
         SUM(quantity_defect)::int   AS total_defects,
         AVG(cycle_time)::numeric(10,2) AS avg_cycle_time,
         COUNT(*)::int               AS log_count
       FROM production_logs
       WHERE machine_id = $1
         AND start_time >= NOW() - INTERVAL '1 day' * $2
       GROUP BY DATE(start_time)
       ORDER BY date DESC`,
      [machineId, days]
    );
    return result.rows;
  },

  /**
   * Get shift-wise production summary.
   */
  async getShiftSummary(startDate, endDate) {
    const result = await query(
      `SELECT
         shift,
         SUM(quantity_produced)::int AS total_produced,
         SUM(quantity_defect)::int   AS total_defects,
         AVG(cycle_time)::numeric(10,2) AS avg_cycle_time,
         COUNT(*)::int               AS log_count
       FROM production_logs
       WHERE start_time >= $1 AND end_time <= $2
       GROUP BY shift
       ORDER BY shift`,
      [startDate, endDate]
    );
    return result.rows;
  },
};

module.exports = ProductionLogModel;

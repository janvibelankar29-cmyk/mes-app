// ============================================
// MES Application - Work Order Model
// ============================================
const { query } = require('../config/db');

const WorkOrderModel = {
  /**
   * Get all work orders with machine and assignee info.
   */
  async findAll(filters = {}) {
    let sql = `
      SELECT wo.*,
             m.name         AS machine_name,
             m.machine_code AS machine_code,
             u.full_name    AS assigned_to_name
      FROM work_orders wo
      LEFT JOIN machines m ON wo.machine_id   = m.id
      LEFT JOIN users u    ON wo.assigned_to  = u.id`;

    const conditions = [];
    const values = [];
    let idx = 1;

    if (filters.status) {
      conditions.push(`wo.status = $${idx++}`);
      values.push(filters.status);
    }
    if (filters.priority) {
      conditions.push(`wo.priority = $${idx++}`);
      values.push(filters.priority);
    }
    if (filters.machine_id) {
      conditions.push(`wo.machine_id = $${idx++}`);
      values.push(filters.machine_id);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY wo.created_at DESC';

    const result = await query(sql, values);
    return result.rows;
  },

  /**
   * Get a single work order by ID with joins.
   */
  async findById(id) {
    const result = await query(
      `SELECT wo.*,
              m.name         AS machine_name,
              m.machine_code AS machine_code,
              u.full_name    AS assigned_to_name
       FROM work_orders wo
       LEFT JOIN machines m ON wo.machine_id  = m.id
       LEFT JOIN users u    ON wo.assigned_to = u.id
       WHERE wo.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Create a new work order.
   */
  async create(data) {
    const {
      order_number, product_name, product_code, machine_id,
      assigned_to, quantity_target, status, priority,
      scheduled_start, scheduled_end, notes,
    } = data;

    const result = await query(
      `INSERT INTO work_orders
         (order_number, product_name, product_code, machine_id, assigned_to,
          quantity_target, status, priority, scheduled_start, scheduled_end, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [
        order_number, product_name, product_code, machine_id,
        assigned_to, quantity_target, status || 'pending',
        priority || 'medium', scheduled_start, scheduled_end, notes,
      ]
    );
    return result.rows[0];
  },

  /**
   * Update a work order.
   */
  async update(id, fields) {
    const allowed = [
      'product_name', 'product_code', 'machine_id', 'assigned_to',
      'quantity_target', 'quantity_produced', 'quantity_defect',
      'status', 'priority', 'scheduled_start', 'scheduled_end',
      'actual_start', 'actual_end', 'notes',
    ];
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
      `UPDATE work_orders SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  },

  /**
   * Delete a work order.
   */
  async delete(id) {
    const result = await query(`DELETE FROM work_orders WHERE id = $1 RETURNING id`, [id]);
    return result.rowCount > 0;
  },

  /**
   * Get work orders for calendar view (scheduled range).
   */
  async findScheduled(startDate, endDate) {
    const result = await query(
      `SELECT wo.*, m.name AS machine_name, m.machine_code
       FROM work_orders wo
       LEFT JOIN machines m ON wo.machine_id = m.id
       WHERE wo.scheduled_start >= $1 AND wo.scheduled_end <= $2
       ORDER BY wo.scheduled_start ASC`,
      [startDate, endDate]
    );
    return result.rows;
  },

  /**
   * Get status summary for dashboard.
   */
  async getStatusSummary() {
    const result = await query(
      `SELECT status, COUNT(*)::int AS count
       FROM work_orders
       GROUP BY status
       ORDER BY status`
    );
    return result.rows;
  },
};

module.exports = WorkOrderModel;

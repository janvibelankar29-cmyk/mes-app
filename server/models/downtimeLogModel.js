// ============================================
// MES Application - Downtime Log Model
// ============================================
const { query } = require('../config/db');

const DowntimeLogModel = {
  /**
   * Get all downtime logs with joined info.
   */
  async findAll(filters = {}) {
    let sql = `
      SELECT dl.*,
             m.name          AS machine_name,
             m.machine_code  AS machine_code,
             u.full_name     AS reported_by_name
      FROM downtime_logs dl
      JOIN machines m   ON dl.machine_id  = m.id
      LEFT JOIN users u ON dl.reported_by = u.id`;

    const conditions = [];
    const values = [];
    let idx = 1;

    if (filters.machine_id) {
      conditions.push(`dl.machine_id = $${idx++}`);
      values.push(filters.machine_id);
    }
    if (filters.reason) {
      conditions.push(`dl.reason = $${idx++}`);
      values.push(filters.reason);
    }
    if (filters.severity) {
      conditions.push(`dl.severity = $${idx++}`);
      values.push(filters.severity);
    }
    if (filters.is_planned !== undefined) {
      conditions.push(`dl.is_planned = $${idx++}`);
      values.push(filters.is_planned);
    }
    if (filters.start_date) {
      conditions.push(`dl.start_time >= $${idx++}`);
      values.push(filters.start_date);
    }
    if (filters.end_date) {
      conditions.push(`dl.start_time <= $${idx++}`);
      values.push(filters.end_date);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY dl.created_at DESC';

    const result = await query(sql, values);
    return result.rows;
  },

  /**
   * Get a single downtime log by ID.
   */
  async findById(id) {
    const result = await query(
      `SELECT dl.*,
              m.name          AS machine_name,
              m.machine_code  AS machine_code,
              u.full_name     AS reported_by_name
       FROM downtime_logs dl
       JOIN machines m   ON dl.machine_id  = m.id
       LEFT JOIN users u ON dl.reported_by = u.id
       WHERE dl.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Create a new downtime log.
   */
  async create(data) {
    const {
      machine_id, work_order_id, reported_by,
      reason, description, root_cause, severity,
      start_time, end_time, duration_minutes,
      is_planned, resolution,
    } = data;

    const result = await query(
      `INSERT INTO downtime_logs
         (machine_id, work_order_id, reported_by, reason, description,
          root_cause, severity, start_time, end_time, duration_minutes,
          is_planned, resolution)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [
        machine_id, work_order_id, reported_by,
        reason, description, root_cause,
        severity || 'medium', start_time, end_time,
        duration_minutes, is_planned || false, resolution,
      ]
    );
    return result.rows[0];
  },

  /**
   * Close a downtime event (set end time and resolution).
   */
  async close(id, { end_time, resolution, root_cause }) {
    const result = await query(
      `UPDATE downtime_logs
       SET end_time = $1,
           duration_minutes = EXTRACT(EPOCH FROM ($1::timestamptz - start_time)) / 60,
           resolution = $2,
           root_cause = COALESCE($3, root_cause)
       WHERE id = $4
       RETURNING *`,
      [end_time || new Date().toISOString(), resolution, root_cause, id]
    );
    return result.rows[0] || null;
  },

  /**
   * Get downtime summary by reason.
   */
  async getReasonSummary(startDate, endDate) {
    const result = await query(
      `SELECT
         reason,
         COUNT(*)::int                        AS incident_count,
         COALESCE(SUM(duration_minutes), 0)::numeric(10,2) AS total_minutes,
         COALESCE(AVG(duration_minutes), 0)::numeric(10,2) AS avg_minutes
       FROM downtime_logs
       WHERE start_time >= $1 AND (end_time <= $2 OR end_time IS NULL)
       GROUP BY reason
       ORDER BY total_minutes DESC`,
      [startDate, endDate]
    );
    return result.rows;
  },

  /**
   * Get downtime summary by machine.
   */
  async getMachineSummary(startDate, endDate) {
    const result = await query(
      `SELECT
         m.machine_code,
         m.name AS machine_name,
         COUNT(*)::int                        AS incident_count,
         COALESCE(SUM(dl.duration_minutes), 0)::numeric(10,2) AS total_minutes,
         SUM(CASE WHEN dl.is_planned THEN 1 ELSE 0 END)::int  AS planned_count,
         SUM(CASE WHEN NOT dl.is_planned THEN 1 ELSE 0 END)::int AS unplanned_count
       FROM downtime_logs dl
       JOIN machines m ON dl.machine_id = m.id
       WHERE dl.start_time >= $1 AND (dl.end_time <= $2 OR dl.end_time IS NULL)
       GROUP BY m.machine_code, m.name
       ORDER BY total_minutes DESC`,
      [startDate, endDate]
    );
    return result.rows;
  },

  /**
   * Get currently open (unresolved) downtime events.
   */
  async findOpen() {
    const result = await query(
      `SELECT dl.*,
              m.name AS machine_name,
              m.machine_code
       FROM downtime_logs dl
       JOIN machines m ON dl.machine_id = m.id
       WHERE dl.end_time IS NULL
       ORDER BY dl.start_time ASC`
    );
    return result.rows;
  },
};

module.exports = DowntimeLogModel;

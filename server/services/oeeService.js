// ============================================
// MES Application - OEE Calculation Service
// ============================================
// OEE = Availability × Performance × Quality
//
// Availability = (Planned Production Time - Downtime) / Planned Production Time
// Performance  = (Ideal Cycle Time × Total Count) / Run Time
// Quality      = Good Count / Total Count
// ============================================
const { query } = require('../config/db');

const OEEService = {
  /**
   * Calculate OEE for a specific machine over a time range.
   * @param {string} machineId - UUID of the machine
   * @param {string} startDate - ISO date string
   * @param {string} endDate   - ISO date string
   * @returns {object} OEE breakdown
   */
  async calculateForMachine(machineId, startDate, endDate) {
    // 1. Get machine info (ideal cycle time = 3600 / max_speed)
    const machineRes = await query(
      `SELECT id, machine_code, name, max_speed FROM machines WHERE id = $1`,
      [machineId]
    );
    if (machineRes.rows.length === 0) return null;

    const machine = machineRes.rows[0];
    const idealCycleTime = machine.max_speed > 0
      ? 3600 / parseFloat(machine.max_speed)  // seconds per unit
      : 30; // default fallback

    // 2. Planned production time (total hours in the range, in seconds)
    const rangeStart = new Date(startDate);
    const rangeEnd = new Date(endDate);
    const plannedTimeSeconds = (rangeEnd - rangeStart) / 1000;

    // 3. Get total downtime (in seconds) for the machine in this range
    const downtimeRes = await query(
      `SELECT COALESCE(SUM(
         EXTRACT(EPOCH FROM (COALESCE(end_time, NOW()) - start_time))
       ), 0)::numeric AS total_downtime_seconds
       FROM downtime_logs
       WHERE machine_id = $1
         AND start_time >= $2
         AND (end_time <= $3 OR end_time IS NULL)`,
      [machineId, startDate, endDate]
    );
    const totalDowntimeSeconds = parseFloat(downtimeRes.rows[0].total_downtime_seconds);

    // 4. Get production totals
    const prodRes = await query(
      `SELECT
         COALESCE(SUM(quantity_produced), 0)::int AS total_produced,
         COALESCE(SUM(quantity_defect), 0)::int   AS total_defects
       FROM production_logs
       WHERE machine_id = $1
         AND start_time >= $2
         AND end_time   <= $3`,
      [machineId, startDate, endDate]
    );
    const totalProduced = prodRes.rows[0].total_produced;
    const totalDefects = prodRes.rows[0].total_defects;
    const goodCount = totalProduced - totalDefects;

    // 5. Calculate OEE components
    const runTime = Math.max(plannedTimeSeconds - totalDowntimeSeconds, 0);

    // Availability
    const availability = plannedTimeSeconds > 0
      ? runTime / plannedTimeSeconds
      : 0;

    // Performance
    const performance = runTime > 0
      ? (idealCycleTime * totalProduced) / runTime
      : 0;

    // Quality
    const quality = totalProduced > 0
      ? goodCount / totalProduced
      : 0;

    // OEE
    const oee = availability * performance * quality;

    return {
      machine: {
        id: machine.id,
        machine_code: machine.machine_code,
        name: machine.name,
        max_speed: machine.max_speed,
      },
      period: { start: startDate, end: endDate },
      metrics: {
        oee:          Math.round(oee * 10000) / 100,          // percentage with 2 decimals
        availability: Math.round(availability * 10000) / 100,
        performance:  Math.round(Math.min(performance, 1) * 10000) / 100,
        quality:      Math.round(quality * 10000) / 100,
      },
      raw: {
        planned_time_hours:  Math.round(plannedTimeSeconds / 3600 * 100) / 100,
        run_time_hours:      Math.round(runTime / 3600 * 100) / 100,
        downtime_hours:      Math.round(totalDowntimeSeconds / 3600 * 100) / 100,
        total_produced:      totalProduced,
        good_count:          goodCount,
        total_defects:       totalDefects,
        ideal_cycle_time:    Math.round(idealCycleTime * 100) / 100,
      },
    };
  },

  /**
   * Calculate OEE for ALL machines over a time range.
   */
  async calculateForAllMachines(startDate, endDate) {
    const machinesRes = await query(`SELECT id FROM machines ORDER BY machine_code`);
    
    // Optimize: Run calculations concurrently instead of sequentially
    const promises = machinesRes.rows.map(machine => 
      this.calculateForMachine(machine.id, startDate, endDate)
    );
    
    const oeeResults = await Promise.all(promises);
    const results = oeeResults.filter(oee => oee !== null);

    // Calculate plant-wide OEE (average)
    const validResults = results.filter((r) => r.metrics.oee > 0);
    const plantOEE = validResults.length > 0
      ? Math.round(
          (validResults.reduce((sum, r) => sum + r.metrics.oee, 0) / validResults.length) * 100
        ) / 100
      : 0;

    return {
      plant_oee: plantOEE,
      machine_count: results.length,
      period: { start: startDate, end: endDate },
      machines: results,
    };
  },

  /**
   * Get OEE trend over multiple days for a machine.
   * Returns daily OEE values.
   */
  async getTrend(machineId, days = 7) {
    const now = new Date();
    const dayPromises = [];

    for (let i = days - 1; i >= 0; i--) {
      const dayStart = new Date(now);
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      // Push the promise without awaiting it immediately
      dayPromises.push(
        this.calculateForMachine(machineId, dayStart.toISOString(), dayEnd.toISOString())
          .then(result => {
            if (result) {
              return {
                date: dayStart.toISOString().split('T')[0],
                ...result.metrics,
              };
            }
            return null;
          })
      );
    }

    // Await all days concurrently
    const results = await Promise.all(dayPromises);
    
    // Filter out nulls and return the ordered array
    return results.filter(r => r !== null);
  },
};

module.exports = OEEService;

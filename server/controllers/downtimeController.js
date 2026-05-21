// ============================================
// MES Application - Downtime Controller
// ============================================
const DowntimeLogModel = require('../models/downtimeLogModel');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

/**
 * GET /api/downtime
 * Query params: machine_id, reason, severity, is_planned, start_date, end_date
 */
const getDowntimeLogs = asyncHandler(async (req, res) => {
  const { machine_id, reason, severity, is_planned, start_date, end_date } = req.query;
  const logs = await DowntimeLogModel.findAll({
    machine_id,
    reason,
    severity,
    is_planned: is_planned !== undefined ? is_planned === 'true' : undefined,
    start_date,
    end_date,
  });

  res.json({
    success: true,
    count: logs.length,
    data: logs,
  });
});

/**
 * GET /api/downtime/open
 * Returns currently unresolved downtime events.
 */
const getOpenDowntime = asyncHandler(async (req, res) => {
  const logs = await DowntimeLogModel.findOpen();

  res.json({ success: true, count: logs.length, data: logs });
});

/**
 * GET /api/downtime/summary/reason
 * Query params: start_date, end_date
 */
const getReasonSummary = asyncHandler(async (req, res) => {
  const { start_date, end_date } = req.query;
  if (!start_date || !end_date) {
    throw new AppError('start_date and end_date query params are required', 400);
  }

  const summary = await DowntimeLogModel.getReasonSummary(start_date, end_date);

  res.json({ success: true, data: summary });
});

/**
 * GET /api/downtime/summary/machine
 * Query params: start_date, end_date
 */
const getMachineSummary = asyncHandler(async (req, res) => {
  const { start_date, end_date } = req.query;
  if (!start_date || !end_date) {
    throw new AppError('start_date and end_date query params are required', 400);
  }

  const summary = await DowntimeLogModel.getMachineSummary(start_date, end_date);

  res.json({ success: true, data: summary });
});

/**
 * GET /api/downtime/:id
 */
const getDowntimeById = asyncHandler(async (req, res) => {
  const log = await DowntimeLogModel.findById(req.params.id);
  if (!log) {
    throw new AppError('Downtime log not found', 404);
  }

  res.json({ success: true, data: log });
});

/**
 * POST /api/downtime
 * Log a new downtime event with issue + root cause.
 */
const createDowntimeLog = asyncHandler(async (req, res) => {
  const log = await DowntimeLogModel.create(req.body);

  // Emit real-time downtime alert
  const io = req.app.locals.io;
  if (io) {
    io.to('floor:overview').emit('downtime:new', {
      id: log.id,
      machine_id: log.machine_id,
      reason: log.reason,
      severity: log.severity,
      is_planned: log.is_planned,
      start_time: log.start_time,
      timestamp: new Date().toISOString(),
    });
  }

  res.status(201).json({ success: true, data: log });
});

/**
 * PUT /api/downtime/:id/close
 * Close / resolve a downtime event.
 * Body: { end_time?, resolution, root_cause? }
 */
const closeDowntime = asyncHandler(async (req, res) => {
  const log = await DowntimeLogModel.close(req.params.id, req.body);
  if (!log) {
    throw new AppError('Downtime log not found', 404);
  }

  // Emit resolution event
  const io = req.app.locals.io;
  if (io) {
    io.to('floor:overview').emit('downtime:resolved', {
      id: log.id,
      machine_id: log.machine_id,
      duration_minutes: log.duration_minutes,
      resolution: log.resolution,
      timestamp: new Date().toISOString(),
    });
  }

  res.json({ success: true, data: log });
});

module.exports = {
  getDowntimeLogs,
  getOpenDowntime,
  getReasonSummary,
  getMachineSummary,
  getDowntimeById,
  createDowntimeLog,
  closeDowntime,
};

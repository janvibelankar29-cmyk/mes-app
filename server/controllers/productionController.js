// ============================================
// MES Application - Production Controller
// ============================================
const ProductionLogModel = require('../models/productionLogModel');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

/**
 * GET /api/production
 * Query params: machine_id, work_order_id, shift, start_date, end_date
 */
const getProductionLogs = asyncHandler(async (req, res) => {
  const { machine_id, work_order_id, shift, start_date, end_date } = req.query;
  const logs = await ProductionLogModel.findAll({
    machine_id, work_order_id, shift, start_date, end_date,
  });

  res.json({
    success: true,
    count: logs.length,
    data: logs,
  });
});

/**
 * GET /api/production/:id
 */
const getProductionLogById = asyncHandler(async (req, res) => {
  const log = await ProductionLogModel.findById(req.params.id);
  if (!log) {
    throw new AppError('Production log not found', 404);
  }

  res.json({ success: true, data: log });
});

/**
 * POST /api/production
 * Logs output & defects, auto-updates work order totals.
 */
const createProductionLog = asyncHandler(async (req, res) => {
  const log = await ProductionLogModel.create(req.body);

  // Emit real-time update
  const io = req.app.locals.io;
  if (io) {
    io.to('floor:overview').emit('production:newLog', {
      id: log.id,
      machine_id: log.machine_id,
      work_order_id: log.work_order_id,
      quantity_produced: log.quantity_produced,
      quantity_defect: log.quantity_defect,
      shift: log.shift,
      timestamp: new Date().toISOString(),
    });

    io.to(`machine:${log.machine_id}`).emit('production:newLog', log);
  }

  res.status(201).json({ success: true, data: log });
});

/**
 * GET /api/production/daily-summary/:machineId
 * Query params: days (default 7)
 */
const getDailySummary = asyncHandler(async (req, res) => {
  const { machineId } = req.params;
  const days = parseInt(req.query.days, 10) || 7;

  const summary = await ProductionLogModel.getDailySummary(machineId, days);

  res.json({ success: true, data: summary });
});

/**
 * GET /api/production/shift-summary
 * Query params: start_date, end_date
 */
const getShiftSummary = asyncHandler(async (req, res) => {
  const { start_date, end_date } = req.query;
  if (!start_date || !end_date) {
    throw new AppError('start_date and end_date query params are required', 400);
  }

  const summary = await ProductionLogModel.getShiftSummary(start_date, end_date);

  res.json({ success: true, data: summary });
});

module.exports = {
  getProductionLogs,
  getProductionLogById,
  createProductionLog,
  getDailySummary,
  getShiftSummary,
};

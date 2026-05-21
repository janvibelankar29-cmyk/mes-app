// ============================================
// MES Application - OEE Controller
// ============================================
const OEEService = require('../services/oeeService');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

/**
 * GET /api/oee/machine/:machineId
 * Query params: start_date, end_date
 */
const getMachineOEE = asyncHandler(async (req, res) => {
  const { machineId } = req.params;
  const { start_date, end_date } = req.query;

  if (!start_date || !end_date) {
    throw new AppError('start_date and end_date query params are required', 400);
  }

  const result = await OEEService.calculateForMachine(machineId, start_date, end_date);
  if (!result) {
    throw new AppError('Machine not found', 404);
  }

  res.json({ success: true, data: result });
});

/**
 * GET /api/oee/plant
 * Query params: start_date, end_date
 */
const getPlantOEE = asyncHandler(async (req, res) => {
  const { start_date, end_date } = req.query;

  if (!start_date || !end_date) {
    throw new AppError('start_date and end_date query params are required', 400);
  }

  const result = await OEEService.calculateForAllMachines(start_date, end_date);

  res.json({ success: true, data: result });
});

/**
 * GET /api/oee/trend/:machineId
 * Query params: days (default 7)
 */
const getOEETrend = asyncHandler(async (req, res) => {
  const { machineId } = req.params;
  const days = parseInt(req.query.days, 10) || 7;

  const trend = await OEEService.getTrend(machineId, days);

  res.json({ success: true, data: trend });
});

module.exports = {
  getMachineOEE,
  getPlantOEE,
  getOEETrend,
};

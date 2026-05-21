// ============================================
// MES Application - Machine Controller
// ============================================
const MachineModel = require('../models/machineModel');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

/**
 * GET /api/machines
 * Query params: status, type, location
 */
const getMachines = asyncHandler(async (req, res) => {
  const { status, type, location } = req.query;
  const machines = await MachineModel.findAll({ status, type, location });

  res.json({
    success: true,
    count: machines.length,
    data: machines,
  });
});

/**
 * GET /api/machines/summary
 * Returns machine count by status.
 */
const getMachineSummary = asyncHandler(async (req, res) => {
  const summary = await MachineModel.getStatusSummary();

  res.json({
    success: true,
    data: summary,
  });
});

/**
 * GET /api/machines/:id
 */
const getMachineById = asyncHandler(async (req, res) => {
  const machine = await MachineModel.findById(req.params.id);
  if (!machine) {
    throw new AppError('Machine not found', 404);
  }

  res.json({ success: true, data: machine });
});

/**
 * POST /api/machines
 */
const createMachine = asyncHandler(async (req, res) => {
  const existing = await MachineModel.findByCode(req.body.machine_code);
  if (existing) {
    throw new AppError(`Machine code '${req.body.machine_code}' already exists`, 409);
  }

  const machine = await MachineModel.create(req.body);
  res.status(201).json({ success: true, data: machine });
});

/**
 * POST /api/machines/:id/status
 * Body: { status: 'running' | 'idle' | ... }
 */
const updateMachineStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const machine = await MachineModel.updateStatus(req.params.id, status);

  if (!machine) {
    throw new AppError('Machine not found', 404);
  }

  // Emit real-time update via Socket.io
  const io = req.app.locals.io;
  if (io) {
    io.to('floor:overview').emit('machine:statusUpdate', {
      machineId: machine.id,
      machine_code: machine.machine_code,
      name: machine.name,
      status: machine.status,
      timestamp: new Date().toISOString(),
    });
  }

  res.json({ success: true, data: machine });
});

/**
 * PUT /api/machines/:id
 */
const updateMachine = asyncHandler(async (req, res) => {
  const machine = await MachineModel.update(req.params.id, req.body);
  if (!machine) {
    throw new AppError('Machine not found or no fields to update', 404);
  }

  res.json({ success: true, data: machine });
});

/**
 * DELETE /api/machines/:id
 */
const deleteMachine = asyncHandler(async (req, res) => {
  const deleted = await MachineModel.delete(req.params.id);
  if (!deleted) {
    throw new AppError('Machine not found', 404);
  }

  res.json({ success: true, message: 'Machine deleted' });
});

module.exports = {
  getMachines,
  getMachineSummary,
  getMachineById,
  createMachine,
  updateMachineStatus,
  updateMachine,
  deleteMachine,
};

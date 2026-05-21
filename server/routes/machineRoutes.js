// ============================================
// MES Application - Machine Routes
// ============================================
const express = require('express');
const router = express.Router();
const { validateUUID } = require('../middleware/validate');
const { validate } = require('../middleware/validate');
const {
  getMachines,
  getMachineSummary,
  getMachineById,
  createMachine,
  updateMachineStatus,
  updateMachine,
  deleteMachine,
} = require('../controllers/machineController');

// Validation schemas
const createSchema = {
  machine_code: { required: true, type: 'string', maxLength: 20 },
  name:         { required: true, type: 'string', maxLength: 100 },
  type:         { required: true, type: 'string', maxLength: 50 },
};

const statusSchema = {
  status: {
    required: true,
    type: 'string',
    enum: ['running', 'idle', 'maintenance', 'breakdown', 'offline'],
  },
};

// Routes
router.get('/',          getMachines);
router.get('/summary',   getMachineSummary);
router.get('/:id',       validateUUID(), getMachineById);
router.post('/',         validate(createSchema), createMachine);
router.post('/:id/status', validateUUID(), validate(statusSchema), updateMachineStatus);
router.put('/:id',       validateUUID(), updateMachine);
router.delete('/:id',   validateUUID(), deleteMachine);

module.exports = router;

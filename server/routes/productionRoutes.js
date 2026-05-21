// ============================================
// MES Application - Production Routes
// ============================================
const express = require('express');
const router = express.Router();
const { validateUUID, validate } = require('../middleware/validate');
const {
  getProductionLogs,
  getProductionLogById,
  createProductionLog,
  getDailySummary,
  getShiftSummary,
} = require('../controllers/productionController');

// Validation schema
const createSchema = {
  work_order_id:    { required: true, type: 'string' },
  machine_id:       { required: true, type: 'string' },
  quantity_produced: { required: true, type: 'number', min: 0 },
  start_time:       { required: true, type: 'string' },
  end_time:         { required: true, type: 'string' },
};

// Routes
router.get('/',                        getProductionLogs);
router.get('/shift-summary',           getShiftSummary);
router.get('/daily-summary/:machineId', validateUUID('machineId'), getDailySummary);
router.get('/:id',                     validateUUID(), getProductionLogById);
router.post('/',                       validate(createSchema), createProductionLog);

module.exports = router;

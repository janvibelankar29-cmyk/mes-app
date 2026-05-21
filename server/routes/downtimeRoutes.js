// ============================================
// MES Application - Downtime Routes
// ============================================
const express = require('express');
const router = express.Router();
const { validateUUID, validate } = require('../middleware/validate');
const {
  getDowntimeLogs,
  getOpenDowntime,
  getReasonSummary,
  getMachineSummary,
  getDowntimeById,
  createDowntimeLog,
  closeDowntime,
} = require('../controllers/downtimeController');

// Validation schema
const createSchema = {
  machine_id: { required: true, type: 'string' },
  reason: {
    required: true,
    type: 'string',
    enum: [
      'mechanical_failure', 'electrical_failure', 'material_shortage',
      'quality_issue', 'changeover', 'planned_maintenance',
      'operator_unavailable', 'power_outage', 'other',
    ],
  },
  severity: {
    type: 'string',
    enum: ['low', 'medium', 'high', 'critical'],
  },
  start_time: { required: true, type: 'string' },
};

const closeSchema = {
  resolution: { required: true, type: 'string', minLength: 3 },
};

// Routes
router.get('/',                getDowntimeLogs);
router.get('/open',            getOpenDowntime);
router.get('/summary/reason',  getReasonSummary);
router.get('/summary/machine', getMachineSummary);
router.get('/:id',             validateUUID(), getDowntimeById);
router.post('/',               validate(createSchema), createDowntimeLog);
router.put('/:id/close',       validateUUID(), validate(closeSchema), closeDowntime);

module.exports = router;

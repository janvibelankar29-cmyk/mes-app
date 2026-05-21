// ============================================
// MES Application - Work Order Routes
// ============================================
const express = require('express');
const router = express.Router();
const { validateUUID, validate } = require('../middleware/validate');
const {
  getWorkOrders,
  getWorkOrderSummary,
  getWorkOrderCalendar,
  getWorkOrderById,
  createWorkOrder,
  updateWorkOrder,
  deleteWorkOrder,
} = require('../controllers/workOrderController');

// Validation schemas
const createSchema = {
  order_number:    { required: true, type: 'string', maxLength: 30 },
  product_name:    { required: true, type: 'string', maxLength: 100 },
  quantity_target: { required: true, type: 'number', min: 1 },
};

const updateSchema = {
  status: {
    type: 'string',
    enum: ['pending', 'in_progress', 'completed', 'cancelled', 'on_hold'],
  },
  priority: {
    type: 'string',
    enum: ['low', 'medium', 'high', 'critical'],
  },
};

// Routes
router.get('/',           getWorkOrders);
router.get('/summary',    getWorkOrderSummary);
router.get('/calendar',   getWorkOrderCalendar);
router.get('/:id',        validateUUID(), getWorkOrderById);
router.post('/',          validate(createSchema), createWorkOrder);
router.put('/:id',        validateUUID(), validate(updateSchema), updateWorkOrder);
router.delete('/:id',     validateUUID(), deleteWorkOrder);

module.exports = router;

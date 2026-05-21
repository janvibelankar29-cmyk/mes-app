// ============================================
// MES Application - Work Order Controller
// ============================================
const WorkOrderModel = require('../models/workOrderModel');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

/**
 * GET /api/work-orders
 * Query params: status, priority, machine_id
 */
const getWorkOrders = asyncHandler(async (req, res) => {
  const { status, priority, machine_id } = req.query;
  const orders = await WorkOrderModel.findAll({ status, priority, machine_id });

  res.json({
    success: true,
    count: orders.length,
    data: orders,
  });
});

/**
 * GET /api/work-orders/summary
 */
const getWorkOrderSummary = asyncHandler(async (req, res) => {
  const summary = await WorkOrderModel.getStatusSummary();

  res.json({ success: true, data: summary });
});

/**
 * GET /api/work-orders/calendar
 * Query params: start, end (ISO date strings)
 */
const getWorkOrderCalendar = asyncHandler(async (req, res) => {
  const { start, end } = req.query;
  if (!start || !end) {
    throw new AppError('start and end query params are required', 400);
  }

  const orders = await WorkOrderModel.findScheduled(start, end);

  // Transform for calendar component
  const events = orders.map((wo) => ({
    id: wo.id,
    title: `${wo.order_number} - ${wo.product_name}`,
    start: wo.scheduled_start,
    end: wo.scheduled_end,
    status: wo.status,
    priority: wo.priority,
    machine: wo.machine_name,
    machine_code: wo.machine_code,
    resource: wo.machine_id,
  }));

  res.json({ success: true, count: events.length, data: events });
});

/**
 * GET /api/work-orders/:id
 */
const getWorkOrderById = asyncHandler(async (req, res) => {
  const order = await WorkOrderModel.findById(req.params.id);
  if (!order) {
    throw new AppError('Work order not found', 404);
  }

  res.json({ success: true, data: order });
});

/**
 * POST /api/work-orders
 */
const createWorkOrder = asyncHandler(async (req, res) => {
  const order = await WorkOrderModel.create(req.body);
  res.status(201).json({ success: true, data: order });
});

/**
 * PUT /api/work-orders/:id
 */
const updateWorkOrder = asyncHandler(async (req, res) => {
  // If status changes to in_progress, set actual_start
  if (req.body.status === 'in_progress') {
    const existing = await WorkOrderModel.findById(req.params.id);
    if (existing && !existing.actual_start) {
      req.body.actual_start = new Date().toISOString();
    }
  }
  // If status changes to completed, set actual_end
  if (req.body.status === 'completed') {
    req.body.actual_end = new Date().toISOString();
  }

  const order = await WorkOrderModel.update(req.params.id, req.body);
  if (!order) {
    throw new AppError('Work order not found or no fields to update', 404);
  }

  res.json({ success: true, data: order });
});

/**
 * DELETE /api/work-orders/:id
 */
const deleteWorkOrder = asyncHandler(async (req, res) => {
  const deleted = await WorkOrderModel.delete(req.params.id);
  if (!deleted) {
    throw new AppError('Work order not found', 404);
  }

  res.json({ success: true, message: 'Work order deleted' });
});

module.exports = {
  getWorkOrders,
  getWorkOrderSummary,
  getWorkOrderCalendar,
  getWorkOrderById,
  createWorkOrder,
  updateWorkOrder,
  deleteWorkOrder,
};

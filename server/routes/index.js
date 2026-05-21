// ============================================
// MES Application - Central Route Index
// ============================================
const express = require('express');
const router = express.Router();

const healthRoutes     = require('./healthRoutes');
const machineRoutes    = require('./machineRoutes');
const workOrderRoutes  = require('./workOrderRoutes');
const productionRoutes = require('./productionRoutes');
const downtimeRoutes   = require('./downtimeRoutes');
const oeeRoutes        = require('./oeeRoutes');

// Mount routes
router.use('/health',      healthRoutes);
router.use('/machines',    machineRoutes);
router.use('/work-orders', workOrderRoutes);
router.use('/production',  productionRoutes);
router.use('/downtime',    downtimeRoutes);
router.use('/oee',         oeeRoutes);

module.exports = router;

// ============================================
// MES Application - OEE Routes
// ============================================
const express = require('express');
const router = express.Router();
const { validateUUID } = require('../middleware/validate');
const {
  getMachineOEE,
  getPlantOEE,
  getOEETrend,
} = require('../controllers/oeeController');

// Routes
router.get('/plant',              getPlantOEE);
router.get('/machine/:machineId', validateUUID('machineId'), getMachineOEE);
router.get('/trend/:machineId',   validateUUID('machineId'), getOEETrend);

module.exports = router;

// ============================================
// MES Application - Model Index
// ============================================
const UserModel = require('./userModel');
const MachineModel = require('./machineModel');
const WorkOrderModel = require('./workOrderModel');
const ProductionLogModel = require('./productionLogModel');
const DowntimeLogModel = require('./downtimeLogModel');

module.exports = {
  UserModel,
  MachineModel,
  WorkOrderModel,
  ProductionLogModel,
  DowntimeLogModel,
};

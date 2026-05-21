-- ============================================
-- MES Application - Seed Data
-- Run AFTER schema.sql
-- psql -U postgres -d mes_db -f seed.sql
-- ============================================

-- ============================================
-- 1. USERS (password is 'password123' hashed with bcrypt)
-- ============================================
INSERT INTO users (username, email, password_hash, full_name, role) VALUES
  ('admin',      'admin@mesapp.com',      '$2b$10$placeholder_hash_admin',      'System Administrator', 'admin'),
  ('jsmith',     'jsmith@mesapp.com',      '$2b$10$placeholder_hash_supervisor', 'John Smith',           'supervisor'),
  ('mjohnson',   'mjohnson@mesapp.com',    '$2b$10$placeholder_hash_operator1',  'Maria Johnson',        'operator'),
  ('dlee',       'dlee@mesapp.com',        '$2b$10$placeholder_hash_operator2',  'David Lee',            'operator'),
  ('agarcia',    'agarcia@mesapp.com',     '$2b$10$placeholder_hash_operator3',  'Ana Garcia',           'operator'),
  ('viewer_user','viewer@mesapp.com',      '$2b$10$placeholder_hash_viewer',     'View Only',            'viewer')
ON CONFLICT (username) DO NOTHING;

-- ============================================
-- 2. MACHINES
-- ============================================
INSERT INTO machines (machine_code, name, type, location, status, max_speed, description, installed_date) VALUES
  ('CNC-001', 'CNC Lathe Alpha',        'CNC Lathe',       'Building A - Line 1', 'running',     120.00, '3-axis CNC lathe for precision turning',          '2022-03-15'),
  ('CNC-002', 'CNC Mill Beta',          'CNC Mill',        'Building A - Line 1', 'idle',        95.00,  '5-axis CNC milling center',                       '2021-08-20'),
  ('INJ-001', 'Injection Molder Gamma', 'Injection Mold',  'Building B - Line 2', 'running',     200.00, 'Hydraulic injection molding machine - 250 ton',    '2023-01-10'),
  ('ASM-001', 'Assembly Robot Delta',   'Assembly',        'Building B - Line 3', 'idle',        300.00, '6-axis robotic assembly cell',                    '2023-06-01'),
  ('PKG-001', 'Packaging Line Epsilon', 'Packaging',       'Building C - Line 4', 'maintenance', 500.00, 'Automated packaging and palletizing line',         '2020-11-22'),
  ('WLD-001', 'Welding Station Zeta',   'Welding',         'Building A - Line 5', 'running',     80.00,  'MIG/TIG automated welding station',                '2022-07-14'),
  ('PNT-001', 'Paint Booth Eta',        'Painting',        'Building C - Line 6', 'offline',     60.00,  'Electrostatic spray painting booth',               '2019-05-30'),
  ('QC-001',  'Quality Scanner Theta',  'Inspection',      'Building A - QC',     'running',     150.00, 'Vision-based quality inspection system',            '2024-02-01')
ON CONFLICT (machine_code) DO NOTHING;

-- ============================================
-- 3. WORK ORDERS
-- ============================================
INSERT INTO work_orders (order_number, product_name, product_code, machine_id, quantity_target, quantity_produced, quantity_defect, status, priority, scheduled_start, scheduled_end)
SELECT
  wo.order_number, wo.product_name, wo.product_code,
  m.id, wo.quantity_target, wo.quantity_produced, wo.quantity_defect,
  wo.status, wo.priority, wo.scheduled_start, wo.scheduled_end
FROM (VALUES
  ('WO-2026-001', 'Precision Shaft A',    'PSA-100',  'CNC-001', 500,  320,  5,  'in_progress', 'high',     '2026-05-19 06:00:00+00', '2026-05-21 18:00:00+00'),
  ('WO-2026-002', 'Housing Assembly B',   'HAB-200',  'CNC-002', 200,  0,    0,  'pending',     'medium',   '2026-05-22 06:00:00+00', '2026-05-24 18:00:00+00'),
  ('WO-2026-003', 'Plastic Cover C',      'PCC-300',  'INJ-001', 1000, 750,  12, 'in_progress', 'critical', '2026-05-18 06:00:00+00', '2026-05-20 18:00:00+00'),
  ('WO-2026-004', 'Control Board D',      'CBD-400',  'ASM-001', 300,  300,  3,  'completed',   'medium',   '2026-05-15 06:00:00+00', '2026-05-17 18:00:00+00'),
  ('WO-2026-005', 'Motor Bracket E',      'MBE-500',  'WLD-001', 150,  50,   2,  'in_progress', 'high',     '2026-05-20 06:00:00+00', '2026-05-22 18:00:00+00'),
  ('WO-2026-006', 'Enclosure Panel F',    'EPF-600',  'PNT-001', 400,  0,    0,  'on_hold',     'low',      '2026-05-25 06:00:00+00', '2026-05-27 18:00:00+00')
) AS wo(order_number, product_name, product_code, machine_code, quantity_target, quantity_produced, quantity_defect, status, priority, scheduled_start, scheduled_end)
JOIN machines m ON m.machine_code = wo.machine_code
ON CONFLICT (order_number) DO NOTHING;

-- ============================================
-- 4. PRODUCTION LOGS
-- ============================================
INSERT INTO production_logs (work_order_id, machine_id, quantity_produced, quantity_defect, cycle_time, shift, start_time, end_time)
SELECT
  wo.id, m.id,
  pl.quantity_produced, pl.quantity_defect, pl.cycle_time, pl.shift,
  pl.start_time::timestamptz, pl.end_time::timestamptz
FROM (VALUES
  ('WO-2026-001', 'CNC-001', 110, 2,  30.5, 'day',     '2026-05-19 06:00:00+00', '2026-05-19 14:00:00+00'),
  ('WO-2026-001', 'CNC-001', 105, 1,  31.2, 'evening', '2026-05-19 14:00:00+00', '2026-05-19 22:00:00+00'),
  ('WO-2026-001', 'CNC-001', 105, 2,  31.0, 'night',   '2026-05-19 22:00:00+00', '2026-05-20 06:00:00+00'),
  ('WO-2026-003', 'INJ-001', 260, 4,  14.5, 'day',     '2026-05-18 06:00:00+00', '2026-05-18 14:00:00+00'),
  ('WO-2026-003', 'INJ-001', 245, 3,  15.1, 'evening', '2026-05-18 14:00:00+00', '2026-05-18 22:00:00+00'),
  ('WO-2026-003', 'INJ-001', 245, 5,  15.0, 'night',   '2026-05-18 22:00:00+00', '2026-05-19 06:00:00+00'),
  ('WO-2026-005', 'WLD-001', 25,  1,  45.0, 'day',     '2026-05-20 06:00:00+00', '2026-05-20 14:00:00+00'),
  ('WO-2026-005', 'WLD-001', 25,  1,  44.5, 'evening', '2026-05-20 14:00:00+00', '2026-05-20 22:00:00+00')
) AS pl(order_number, machine_code, quantity_produced, quantity_defect, cycle_time, shift, start_time, end_time)
JOIN work_orders wo ON wo.order_number = pl.order_number
JOIN machines m     ON m.machine_code  = pl.machine_code;

-- ============================================
-- 5. DOWNTIME LOGS
-- ============================================
INSERT INTO downtime_logs (machine_id, reported_by, reason, description, root_cause, severity, start_time, end_time, duration_minutes, is_planned, resolution)
SELECT
  m.id, u.id,
  dl.reason, dl.description, dl.root_cause, dl.severity,
  dl.start_time::timestamptz, dl.end_time::timestamptz,
  dl.duration_minutes, dl.is_planned, dl.resolution
FROM (VALUES
  ('CNC-001', 'mjohnson', 'mechanical_failure',    'Spindle vibration alarm',              'Worn spindle bearing',          'high',     '2026-05-19 10:30:00+00', '2026-05-19 11:15:00+00', 45,   FALSE, 'Replaced spindle bearing'),
  ('INJ-001', 'dlee',     'material_shortage',     'Ran out of ABS pellets',               'Late supplier delivery',        'medium',   '2026-05-18 16:00:00+00', '2026-05-18 17:30:00+00', 90,   FALSE, 'Emergency material order fulfilled'),
  ('PKG-001', 'jsmith',   'planned_maintenance',   'Scheduled quarterly maintenance',      NULL,                            'low',      '2026-05-20 06:00:00+00', '2026-05-20 14:00:00+00', 480,  TRUE,  'Full lubrication, belt replacement, calibration'),
  ('WLD-001', 'agarcia',  'electrical_failure',    'Wire feed motor stalled',              'Faulty motor driver board',     'critical', '2026-05-20 09:00:00+00', '2026-05-20 09:45:00+00', 45,   FALSE, 'Replaced motor driver PCB'),
  ('PNT-001', 'jsmith',   'quality_issue',         'Paint viscosity out of spec',          'Temperature controller drift',  'medium',   '2026-05-17 08:00:00+00', NULL,                     NULL, FALSE, NULL),
  ('CNC-002', 'mjohnson', 'changeover',            'Tooling change for new batch',         NULL,                            'low',      '2026-05-21 06:00:00+00', '2026-05-21 07:00:00+00', 60,   TRUE,  'Completed changeover to HAB-200 tooling')
) AS dl(machine_code, username, reason, description, root_cause, severity, start_time, end_time, duration_minutes, is_planned, resolution)
JOIN machines m ON m.machine_code = dl.machine_code
JOIN users u    ON u.username     = dl.username;

-- ============================================
-- Verify counts
-- ============================================
SELECT 'users' AS table_name, COUNT(*) AS row_count FROM users
UNION ALL SELECT 'machines',        COUNT(*) FROM machines
UNION ALL SELECT 'work_orders',     COUNT(*) FROM work_orders
UNION ALL SELECT 'production_logs', COUNT(*) FROM production_logs
UNION ALL SELECT 'downtime_logs',   COUNT(*) FROM downtime_logs
ORDER BY table_name;

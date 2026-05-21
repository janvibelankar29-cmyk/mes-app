-- ============================================
-- MES Application - Database Schema
-- Run: psql -U postgres -d mes_db -f schema.sql
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username      VARCHAR(50)  NOT NULL UNIQUE,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(100) NOT NULL,
  role          VARCHAR(20)  NOT NULL DEFAULT 'operator'
                CHECK (role IN ('admin', 'supervisor', 'operator', 'viewer')),
  is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
  last_login    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_role      ON users (role);
CREATE INDEX idx_users_is_active ON users (is_active);
CREATE INDEX idx_users_email     ON users (email);

-- ============================================
-- 2. MACHINES
-- ============================================
CREATE TABLE IF NOT EXISTS machines (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  machine_code      VARCHAR(20)  NOT NULL UNIQUE,
  name              VARCHAR(100) NOT NULL,
  type              VARCHAR(50)  NOT NULL,
  location          VARCHAR(100),
  status            VARCHAR(20)  NOT NULL DEFAULT 'idle'
                    CHECK (status IN ('running', 'idle', 'maintenance', 'breakdown', 'offline')),
  max_speed         NUMERIC(10, 2),            -- units per hour (ideal)
  description       TEXT,
  installed_date    DATE,
  last_maintenance  TIMESTAMPTZ,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_machines_status ON machines (status);
CREATE INDEX idx_machines_type   ON machines (type);
CREATE INDEX idx_machines_code   ON machines (machine_code);

-- ============================================
-- 3. WORK ORDERS
-- ============================================
CREATE TABLE IF NOT EXISTS work_orders (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number      VARCHAR(30)  NOT NULL UNIQUE,
  product_name      VARCHAR(100) NOT NULL,
  product_code      VARCHAR(50),
  machine_id        UUID         REFERENCES machines(id) ON DELETE SET NULL,
  assigned_to       UUID         REFERENCES users(id)    ON DELETE SET NULL,
  quantity_target   INTEGER      NOT NULL CHECK (quantity_target > 0),
  quantity_produced INTEGER      NOT NULL DEFAULT 0 CHECK (quantity_produced >= 0),
  quantity_defect   INTEGER      NOT NULL DEFAULT 0 CHECK (quantity_defect >= 0),
  status            VARCHAR(20)  NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'on_hold')),
  priority          VARCHAR(10)  NOT NULL DEFAULT 'medium'
                    CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  scheduled_start   TIMESTAMPTZ,
  scheduled_end     TIMESTAMPTZ,
  actual_start      TIMESTAMPTZ,
  actual_end        TIMESTAMPTZ,
  notes             TEXT,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_work_orders_status     ON work_orders (status);
CREATE INDEX idx_work_orders_machine    ON work_orders (machine_id);
CREATE INDEX idx_work_orders_assigned   ON work_orders (assigned_to);
CREATE INDEX idx_work_orders_priority   ON work_orders (priority);
CREATE INDEX idx_work_orders_scheduled  ON work_orders (scheduled_start, scheduled_end);
CREATE INDEX idx_work_orders_number     ON work_orders (order_number);

-- ============================================
-- 4. PRODUCTION LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS production_logs (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  work_order_id     UUID         NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  machine_id        UUID         NOT NULL REFERENCES machines(id)    ON DELETE CASCADE,
  operator_id       UUID         REFERENCES users(id)                ON DELETE SET NULL,
  quantity_produced INTEGER      NOT NULL CHECK (quantity_produced >= 0),
  quantity_defect   INTEGER      NOT NULL DEFAULT 0 CHECK (quantity_defect >= 0),
  cycle_time        NUMERIC(10, 2),       -- seconds per unit
  shift             VARCHAR(10)  NOT NULL DEFAULT 'day'
                    CHECK (shift IN ('day', 'evening', 'night')),
  start_time        TIMESTAMPTZ  NOT NULL,
  end_time          TIMESTAMPTZ  NOT NULL,
  notes             TEXT,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_production_time CHECK (end_time > start_time)
);

CREATE INDEX idx_production_logs_work_order ON production_logs (work_order_id);
CREATE INDEX idx_production_logs_machine    ON production_logs (machine_id);
CREATE INDEX idx_production_logs_operator   ON production_logs (operator_id);
CREATE INDEX idx_production_logs_shift      ON production_logs (shift);
CREATE INDEX idx_production_logs_time       ON production_logs (start_time, end_time);
CREATE INDEX idx_production_logs_created    ON production_logs (created_at DESC);

-- ============================================
-- 5. DOWNTIME LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS downtime_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  machine_id      UUID         NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  work_order_id   UUID         REFERENCES work_orders(id)       ON DELETE SET NULL,
  reported_by     UUID         REFERENCES users(id)             ON DELETE SET NULL,
  reason          VARCHAR(50)  NOT NULL
                  CHECK (reason IN (
                    'mechanical_failure', 'electrical_failure', 'material_shortage',
                    'quality_issue', 'changeover', 'planned_maintenance',
                    'operator_unavailable', 'power_outage', 'other'
                  )),
  description     TEXT,
  root_cause      TEXT,
  severity        VARCHAR(10)  NOT NULL DEFAULT 'medium'
                  CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  start_time      TIMESTAMPTZ  NOT NULL,
  end_time        TIMESTAMPTZ,
  duration_minutes NUMERIC(10, 2),       -- computed or stored on close
  is_planned      BOOLEAN      NOT NULL DEFAULT FALSE,
  resolution      TEXT,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_downtime_logs_machine   ON downtime_logs (machine_id);
CREATE INDEX idx_downtime_logs_reason    ON downtime_logs (reason);
CREATE INDEX idx_downtime_logs_severity  ON downtime_logs (severity);
CREATE INDEX idx_downtime_logs_time      ON downtime_logs (start_time, end_time);
CREATE INDEX idx_downtime_logs_planned   ON downtime_logs (is_planned);
CREATE INDEX idx_downtime_logs_created   ON downtime_logs (created_at DESC);

-- ============================================
-- 6. UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_machines_updated_at
  BEFORE UPDATE ON machines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_work_orders_updated_at
  BEFORE UPDATE ON work_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_downtime_logs_updated_at
  BEFORE UPDATE ON downtime_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

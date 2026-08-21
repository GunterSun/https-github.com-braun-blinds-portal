CREATE TABLE IF NOT EXISTS factory_work_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assignment_id INTEGER NOT NULL UNIQUE,
  drawing_id INTEGER NOT NULL,
  window_id INTEGER NOT NULL,
  measurement_version_id INTEGER NOT NULL,
  drawing_version INTEGER NOT NULL,
  drawing_sha256 TEXT NOT NULL,
  factory_name TEXT NOT NULL,
  factory_code TEXT NOT NULL DEFAULT '',
  factory_order_number TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'queued',
  expected_completion_at TEXT,
  completed_at TEXT,
  notes TEXT NOT NULL DEFAULT '',
  created_by INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS factory_work_orders_window_idx ON factory_work_orders(window_id, created_at);
CREATE INDEX IF NOT EXISTS factory_work_orders_status_idx ON factory_work_orders(status, expected_completion_at);

CREATE TABLE IF NOT EXISTS factory_work_order_freight (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  work_order_id INTEGER NOT NULL,
  carrier TEXT NOT NULL DEFAULT '',
  tracking_number TEXT NOT NULL DEFAULT '',
  currency TEXT NOT NULL DEFAULT 'USD',
  amount_cents INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'planned',
  shipped_at TEXT,
  received_at TEXT,
  notes TEXT NOT NULL DEFAULT '',
  created_by INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS factory_work_order_freight_work_order_idx ON factory_work_order_freight(work_order_id, created_at);
CREATE INDEX IF NOT EXISTS factory_work_order_freight_tracking_idx ON factory_work_order_freight(tracking_number);
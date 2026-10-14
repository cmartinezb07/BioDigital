CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  access_token_hash TEXT NOT NULL UNIQUE,
  idempotency_key TEXT NOT NULL UNIQUE,
  request_fingerprint TEXT NOT NULL,
  sku TEXT NOT NULL,
  title TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (typeof(amount) = 'integer' AND amount > 0),
  currency TEXT NOT NULL DEFAULT 'CLP' CHECK (currency = 'CLP'),
  purpose TEXT NOT NULL CHECK (purpose IN ('full', 'deposit', 'balance')),
  project_reference TEXT,
  parent_order_id TEXT REFERENCES orders(id),
  status TEXT NOT NULL CHECK (
    status IN (
      'pending_creation',
      'creating',
      'created',
      'creation_failed',
      'pending',
      'accredited',
      'rejected',
      'cancelled',
      'partially_refunded',
      'refunded',
      'charged_back'
    )
  ),
  external_reference TEXT NOT NULL UNIQUE,
  mp_order_id TEXT UNIQUE,
  mp_status TEXT,
  mp_status_detail TEXT,
  verified_paid_amount INTEGER CHECK (
    verified_paid_amount IS NULL OR
    (typeof(verified_paid_amount) = 'integer' AND verified_paid_amount >= 0)
  ),
  mp_last_updated_at TEXT,
  last_verified_at TEXT,
  verification_version INTEGER NOT NULL DEFAULT 0 CHECK (verification_version >= 0),
  checkout_url TEXT,
  creation_attempts INTEGER NOT NULL DEFAULT 0 CHECK (creation_attempts >= 0),
  last_error_code TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);
CREATE INDEX IF NOT EXISTS orders_parent_order_idx ON orders(parent_order_id);
CREATE INDEX IF NOT EXISTS orders_project_reference_idx ON orders(project_reference);

CREATE TABLE IF NOT EXISTS payment_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_key TEXT NOT NULL UNIQUE,
  event_id TEXT NOT NULL,
  request_id TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  action TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('webhook', 'reconciliation')),
  outcome TEXT NOT NULL CHECK (outcome IN ('verified', 'rejected')),
  observed_status TEXT NOT NULL,
  observed_status_detail TEXT NOT NULL,
  normalized_status TEXT,
  error_code TEXT,
  received_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS payment_events_resource_idx
  ON payment_events(resource_id, received_at);

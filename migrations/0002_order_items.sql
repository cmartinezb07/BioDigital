CREATE TABLE IF NOT EXISTS order_items (
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  position INTEGER NOT NULL CHECK (position >= 0),
  sku TEXT NOT NULL,
  title TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (typeof(amount) = 'integer' AND amount > 0),
  currency TEXT NOT NULL CHECK (currency = 'CLP'),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity = 1),
  PRIMARY KEY (order_id, position),
  UNIQUE (order_id, sku)
);

CREATE INDEX IF NOT EXISTS order_items_sku_idx ON order_items(sku);

-- mp_order_id pasa a contener el ID de la orden comercial de Checkout Pro.
-- Las antiguas órdenes ORD no son compatibles; no se migran pagos reales.
ALTER TABLE orders ADD COLUMN mp_preference_id TEXT;
ALTER TABLE orders ADD COLUMN reconciliation_bucket INTEGER;
CREATE UNIQUE INDEX orders_preference_idx ON orders(mp_preference_id);

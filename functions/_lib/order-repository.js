const SELECT_COLUMNS = `
  id, access_token_hash, idempotency_key, request_fingerprint, sku, title,
  amount, currency, purpose, project_reference, parent_order_id, status,
  external_reference, mp_order_id, mp_preference_id, mp_status, checkout_url,
  mp_status_detail, verified_paid_amount, mp_last_updated_at, last_verified_at,
  verification_version, creation_attempts, last_error_code, created_at, updated_at
`;

export class D1OrderRepository {
  constructor(database) {
    if (!database?.prepare) throw new Error('D1 binding DB is missing');
    this.database = database;
  }

  async withItems(order) {
    if (!order) return null;
    const result = await this.database.prepare(
      'SELECT sku, title, amount, currency, quantity FROM order_items WHERE order_id = ? ORDER BY position'
    ).bind(order.id).all();
    return { ...order, items: result.results || [] };
  }

  async findByIdempotencyKey(key) {
    const order = await this.database.prepare(
      `SELECT ${SELECT_COLUMNS} FROM orders WHERE idempotency_key = ? LIMIT 1`
    ).bind(key).first();
    return this.withItems(order);
  }

  async findByPublicAccess(id, accessTokenHash) {
    const order = await this.database.prepare(
      `SELECT ${SELECT_COLUMNS} FROM orders WHERE id = ? AND access_token_hash = ? LIMIT 1`
    ).bind(id, accessTokenHash).first();
    return this.withItems(order);
  }

  async findByExternalReference(reference) {
    const order = await this.database.prepare(
      `SELECT ${SELECT_COLUMNS} FROM orders WHERE external_reference = ? LIMIT 1`
    ).bind(reference).first();
    return this.withItems(order);
  }

  async findWebhookEvent(eventKey) {
    return this.database.prepare(
      'SELECT event_key, outcome FROM payment_events WHERE event_key = ? LIMIT 1'
    ).bind(eventKey).first();
  }

  async insert(order) {
    const statements = [this.database.prepare(`
      INSERT INTO orders (
        id, access_token_hash, idempotency_key, request_fingerprint, sku, title,
        amount, currency, purpose, project_reference, parent_order_id, status,
        external_reference, mp_order_id, mp_status, checkout_url,
        creation_attempts, last_error_code, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL, 0, NULL, ?, ?)
    `).bind(
      order.id, order.access_token_hash, order.idempotency_key,
      order.request_fingerprint, order.sku, order.title, order.amount,
      order.currency, order.purpose, order.project_reference,
      order.parent_order_id, order.status, order.external_reference,
      order.created_at, order.updated_at
    )];
    for (const [position, item] of order.items.entries()) {
      statements.push(this.database.prepare(`
        INSERT INTO order_items (
          order_id, position, sku, title, amount, currency, quantity
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(order.id, position, item.sku, item.title, item.amount, item.currency, item.quantity));
    }
    await this.database.batch(statements);
  }

  async markCreating(id, updatedAt) {
    const result = await this.database.prepare(`
      UPDATE orders
      SET status = 'creating', creation_attempts = creation_attempts + 1,
          last_error_code = NULL, updated_at = ?
      WHERE id = ? AND status IN ('pending_creation', 'creation_failed')
    `).bind(updatedAt, id).run();
    return Number(result.meta?.changes || 0) === 1;
  }

  async markCreated(id, mpOrder, updatedAt) {
    await this.database.prepare(`
      UPDATE orders
      SET status = 'created', mp_preference_id = ?, mp_status = ?, checkout_url = ?,
          last_error_code = NULL, updated_at = ?
      WHERE id = ?
    `).bind(mpOrder.id, mpOrder.status, mpOrder.checkoutUrl, updatedAt, id).run();
  }

  async markCreationFailed(id, errorCode, updatedAt) {
    await this.database.prepare(`
      UPDATE orders
      SET status = 'creation_failed', last_error_code = ?, updated_at = ?
      WHERE id = ?
    `).bind(errorCode, updatedAt, id).run();
  }


  async applyVerification(order, event, verification, now) {
    const allowedFrom = verification.allowedFrom;
    const placeholders = allowedFrom.map(() => '?').join(', ');
    const results = await this.database.batch([
      this.database.prepare(`
        UPDATE orders SET
          mp_order_id = ?, status = ?, mp_status = ?, mp_status_detail = ?, verified_paid_amount = ?,
          mp_last_updated_at = ?, last_verified_at = ?, updated_at = ?,
          verification_version = verification_version + 1, last_error_code = NULL
        WHERE id = ? AND mp_preference_id = ?
          AND (mp_order_id IS NULL OR mp_order_id = ?)
          AND status IN (${placeholders})
          AND (mp_last_updated_at IS NULL OR ? >= mp_last_updated_at)
          AND NOT EXISTS (SELECT 1 FROM payment_events WHERE event_key = ? AND outcome = 'verified')
      `).bind(
        verification.merchantOrderId, verification.state, verification.mpStatus, verification.statusDetail,
        verification.netPaidAmount, verification.lastUpdatedAt, now, now,
        order.id, order.mp_preference_id, verification.merchantOrderId, ...allowedFrom,
        verification.lastUpdatedAt, event.eventKey
      ),
      this.database.prepare(`
        INSERT INTO payment_events (
          event_key, event_id, request_id, resource_id, action, source,
          outcome, observed_status, observed_status_detail, normalized_status,
          error_code, received_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'verified', ?, ?, ?, NULL, ?)
        ON CONFLICT(event_key) DO UPDATE SET
          outcome = 'verified', observed_status = excluded.observed_status,
          observed_status_detail = excluded.observed_status_detail,
          normalized_status = excluded.normalized_status, error_code = NULL
        WHERE payment_events.outcome = 'rejected'
      `).bind(
        event.eventKey, event.eventId, event.requestId, event.resourceId || verification.merchantOrderId,
        event.action, event.source, verification.mpStatus,
        verification.statusDetail, verification.state, now
      )
    ]);
    return Number(results[0]?.meta?.changes || 0) > 0;
  }

  async recordRejectedEvent(order, event, errorCode, now) {
    await this.database.prepare(`
      INSERT OR IGNORE INTO payment_events (
        event_key, event_id, request_id, resource_id, action, source,
        outcome, observed_status, observed_status_detail, normalized_status,
        error_code, received_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'rejected', 'unverified', 'unverified', NULL, ?, ?)
    `).bind(
      event.eventKey, event.eventId, event.requestId, event.resourceId || order.mp_preference_id,
      event.action, event.source, errorCode, now
    ).run();
  }

  async claimReconciliation(id, bucket) {
    const result = await this.database.prepare(`
      UPDATE orders SET reconciliation_bucket = ?
      WHERE id = ? AND (reconciliation_bucket IS NULL OR reconciliation_bucket < ?)
    `).bind(bucket, id, bucket).run();
    return Number(result.meta?.changes || 0) === 1;
  }
}

export function isUniqueConstraintError(error) {
  return /unique constraint|primary key/i.test(String(error?.message || error));
}

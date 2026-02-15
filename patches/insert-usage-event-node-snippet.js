// patches/insert-usage-event-node-snippet.js
// schema-aware insertion snippet (Node). Call after successful upload.
// Usage: set orgId, costCents, fileKey/requestId per function context and call.
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * Insert a schema-aware usage_event for generation functions.
 * Maps generation/mockup to kind = 'AI_MOCKUP'.
 * @param {{orgId: string, costCents?: number, fileKey?: string, requestId?: string}} params
 */
export async function insertUsageEventForGeneration({
  orgId,
  costCents = 0,
  fileKey = null,
  requestId = null,
}) {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL not set");
  }

  const client = await pool.connect();
  try {
    // Detect which columns exist and construct a safe INSERT
    const colsRes = await client.query(`
      SELECT
        EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='usage_events' AND column_name='kind') AS has_kind,
        EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='usage_events' AND column_name='event_type') AS has_event_type,
        EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='usage_events' AND column_name='unit_cost_cents') AS has_unit_cost,
        EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='usage_events' AND column_name='amount_cents') AS has_amount_cents,
        EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='usage_events' AND column_name='metadata') AS has_metadata,
        EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='usage_events' AND column_name='file_key') AS has_file_key
    `);

    const r = colsRes.rows[0];
    const hasKind = r.has_kind;
    const hasEventType = r.has_event_type;
    const hasUnitCost = r.has_unit_cost;
    const hasAmount = r.has_amount_cents;
    const hasMetadata = r.has_metadata;
    const hasFileKey = r.has_file_key;

    // We'll use kind = 'AI_MOCKUP' per schema mapping
    const mappedKind = "AI_MOCKUP";

    const columns = ["id", "org_id"];
    const values = ["gen_random_uuid()", "$1"];
    const params = [orgId];

    let paramIndex = 2;

    if (hasKind) {
      columns.push("kind");
      values.push(`$${paramIndex++}`);
      params.push(mappedKind);
    } else if (hasEventType) {
      columns.push("event_type");
      values.push(`$${paramIndex++}`);
      params.push(mappedKind);
    }

    if (hasUnitCost) {
      columns.push("unit_cost_cents");
      values.push(`$${paramIndex++}`);
      params.push(costCents);
    } else if (hasAmount) {
      columns.push("amount_cents");
      values.push(`$${paramIndex++}`);
      params.push(costCents);
    }

    if (hasMetadata) {
      columns.push("metadata");
      values.push(`$${paramIndex++}`);
      const meta = {
        source: "function_insert",
        file_key: fileKey || null,
        request_id: requestId || null,
      };
      params.push(meta);
    } else if (hasFileKey) {
      columns.push("file_key");
      values.push(`$${paramIndex++}`);
      params.push(fileKey);
    }

    columns.push("created_at");
    values.push("now()");

    const sql = `INSERT INTO usage_events (${columns.join(",")}) VALUES (${values.join(",")})`;

    await client.query(sql, params);
  } finally {
    client.release();
  }
}

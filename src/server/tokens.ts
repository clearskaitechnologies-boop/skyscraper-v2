import { pool } from "./db";

export async function creditByOrder(orgId: string, packId: string, orderId: string) {
  const c = await pool.connect();
  try {
    await c.query("BEGIN");
    const r = await c.query(
      "select credit_tokens_by_order($1::uuid,$2::text,$3::text) as balance",
      [orgId, packId, orderId]
    );
    await c.query("COMMIT");
    return Number(r.rows[0].balance);
  } catch (e) {
    await c.query("ROLLBACK");
    throw e;
  } finally {
    c.release();
  }
}

export async function latestBalance(orgId: string) {
  const r = await pool.query(
    "select balance_after from tokens_ledger where org_id=$1 order by created_at desc limit 1",
    [orgId]
  );
  return r.rowCount ? Number(r.rows[0].balance_after) : 0;
}

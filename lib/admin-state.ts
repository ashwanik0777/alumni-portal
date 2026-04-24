import { postgresPool } from "@/lib/postgres";

export type PersistedAdminState = {
  rows?: unknown[];
  scholarshipFundingMap?: unknown[];
  analyticsDateRange?: string;
  analyticsCustomFrom?: string;
  analyticsCustomTo?: string;
  [key: string]: unknown;
};

let stateTableReady = false;
let stateTableInitPromise: Promise<void> | null = null;

async function ensureAdminStateTable() {
  if (stateTableReady) return;
  if (stateTableInitPromise) { await stateTableInitPromise; return; }

  stateTableInitPromise = (async () => {
    try {
      await postgresPool.query(`
        CREATE TABLE IF NOT EXISTS admin_dynamic_state (
          state_key TEXT PRIMARY KEY,
          payload JSONB NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      stateTableReady = true;
    } finally {
      stateTableInitPromise = null;
    }
  })();

  await stateTableInitPromise;
}

export async function getAdminState(stateKey: string) {
  await ensureAdminStateTable();

  const result = await postgresPool.query<{ payload: PersistedAdminState }>(
    `SELECT payload FROM admin_dynamic_state WHERE state_key = $1 LIMIT 1`,
    [stateKey],
  );

  if ((result.rowCount ?? 0) === 0) {
    return null;
  }

  return result.rows[0].payload;
}

export async function saveAdminState(stateKey: string, payload: PersistedAdminState) {
  await ensureAdminStateTable();

  await postgresPool.query(
    `
    INSERT INTO admin_dynamic_state (state_key, payload)
    VALUES ($1, $2::jsonb)
    ON CONFLICT (state_key)
    DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()
    `,
    [stateKey, JSON.stringify(payload)],
  );
}

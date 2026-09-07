import pg from "pg";
import { config } from "../config.js";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 12,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 8_000,
  ssl: config.databaseUrl.includes("sslmode=require") ? { rejectUnauthorized: false } : undefined,
});

pool.on("error", (err) => {
  console.error("[pg] idle client error", err.message);
});

export async function query<T = any>(text: string, params: unknown[] = []): Promise<T[]> {
  const start = Date.now();
  const res = await pool.query(text, params as any[]);
  const ms = Date.now() - start;
  if (ms > 200) console.warn(`[pg] slow query (${ms}ms): ${text.slice(0, 140)}`);
  return res.rows as T[];
}

export async function queryOne<T = any>(text: string, params: unknown[] = []): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

export async function withTx<T>(fn: (q: <R = any>(t: string, p?: unknown[]) => Promise<R[]>) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const run = async <R = any>(t: string, p: unknown[] = []): Promise<R[]> => {
      const res = await client.query(t, p as any[]);
      return res.rows as R[];
    };
    const out = await fn(run);
    await client.query("COMMIT");
    return out;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

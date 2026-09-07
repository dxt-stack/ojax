import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "./pool.js";
import { logger } from "../lib/logger.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(here, "migrations");

async function ensureTable() {
  await pool.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`);
}

export async function migrate(opts: { fresh?: boolean } = {}) {
  if (opts.fresh) {
    logger.warn("Resetting database schema (DROP SCHEMA public CASCADE)...");
    await pool.query("DROP SCHEMA public CASCADE");
    await pool.query("CREATE SCHEMA public");
  }
  await ensureTable();

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const { rows } = await pool.query("SELECT version FROM schema_migrations");
  const applied = new Set(rows.map((r) => r.version));

  for (const file of files) {
    if (applied.has(file)) {
      logger.debug(`migration ${file} already applied`);
      continue;
    }
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
    logger.info(`applying migration ${file}...`);
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (version) VALUES ($1)", [file]);
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }
}

// CLI entrypoint: node dist/db/migrate.js [--fresh]
const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  migrate({ fresh: process.argv.includes("--fresh") })
    .then(() => {
      logger.info("migrations complete");
      process.exit(0);
    })
    .catch((e) => {
      logger.error("migration failed", e);
      process.exit(1);
    });
}

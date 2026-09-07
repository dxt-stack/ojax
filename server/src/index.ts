import { createApp } from "./app.js";
import { config, validateConfig } from "./config.js";
import { migrate } from "./db/migrate.js";
import { pool } from "./db/pool.js";
import { logger } from "./lib/logger.js";

async function boot() {
  logger.info("OjaX API starting...");
  validateConfig();
  try {
    await pool.query("SELECT 1");
  } catch (e) {
    logger.error("Cannot reach PostgreSQL. Is it running? DATABASE_URL=", { url: config.databaseUrl.replace(/:[^:@/]+@/, ":***@") });
    process.exit(1);
  }

  await migrate();

  if (config.demoSeeding && config.env !== "production") {
    try {
      const { ensureSeed } = await import("./db/seed.js");
      await ensureSeed();
    } catch (e) {
      logger.warn("seed skipped (continuing anyway)", e instanceof Error ? e.message : e);
    }
  }

  const app = createApp();
  app.listen(config.port, config.host, () => {
    logger.info(`OjaX API listening on http://${config.host}:${config.port} (${config.env})`);
  });
}

boot().catch((e) => {
  logger.error("Fatal boot error", e);
  process.exit(1);
});

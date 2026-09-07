/**
 * purge-demo.ts — one-command switch from showroom → real marketplace.
 *
 * Deletes every seeded demo account (@*.ojax.demo) and everything they own:
 * listings/photos, carts, favourites, conversations, notifications, and any
 * orders they placed as buyers. Real users' purchase history (order item
 * snapshots) survives even if a demo user was the seller.
 *
 * Usage:  npm run db:purge-demo
 */
import { pool } from "./pool.js";
import { logger } from "../lib/logger.js";

export async function purgeDemo() {
  logger.warn("Purging demo data (@*.ojax.demo users + their content)...");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Demo users' own orders (payments + events cascade)
    await client.query(
      `DELETE FROM orders WHERE buyer_id IN (SELECT id FROM users WHERE email LIKE '%@ojax.demo')`,
    );
    await client.query(
      `DELETE FROM listing_reviews WHERE buyer_id IN (SELECT id FROM users WHERE email LIKE '%@ojax.demo')
         OR seller_id IN (SELECT id FROM users WHERE email LIKE '%@ojax.demo')`,
    );
    // Everything else cascades from the user rows (listings → images, chats, etc.)
    const res = await client.query(
      `DELETE FROM users WHERE email LIKE '%@ojax.demo' RETURNING id`,
    );

    await client.query("COMMIT");
    logger.info(`Purged ${res.rowCount} demo account(s). The market is now real-only.`);
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

const isMain = process.argv[1] && process.argv[1].endsWith("purge-demo.ts");
if (isMain) {
  purgeDemo()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}

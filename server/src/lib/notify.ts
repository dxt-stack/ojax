import { config } from "../config.js";
import { query } from "../db/pool.js";
import { logger } from "./logger.js";

type NotifyKind = "message" | "order" | "listing" | "event" | "system";

/**
 * Insert an in-app notification. Emails are intentionally dev-mode no-ops
 * until SMTP credentials are configured in .env — see README "Emails".
 */
export async function notify(userId: string, kind: NotifyKind, title: string, body = "", link?: string) {
  try {
    await query(
      `INSERT INTO notifications (user_id, kind, title, body, link) VALUES ($1,$2,$3,$4,$5)`,
      [userId, kind, title, body, link || null],
    );
  } catch (e) {
    logger.error("notify failed", e);
  }
}

export async function notifyMany(userIds: string[], kind: NotifyKind, title: string, body = "", link?: string) {
  if (!userIds.length) return;
  for (const id of userIds) {
    await notify(id, kind, title, body, link);
  }
}

export async function sendEmail(_to: string, _subject: string, _html: string): Promise<void> {
  const configured = !!(config.smtp.host && config.smtp.user);
  if (!configured) {
    logger.debug(`[mail:dev] would send "${_subject}" to ${_to}`);
    return;
  }
  logger.warn("SMTP not yet wired — configure nodemailer in lib/mailer.ts");
}

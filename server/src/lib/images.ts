import path from "node:path";
import sharp from "sharp";
import { config } from "../config.js";
import { query, queryOne } from "../db/pool.js";
import { HttpError } from "../lib/errors.js";
import type { Express } from "express";

export const UPLOAD_MIME_WHITELIST = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const YEAR_MONTH = new Date().toISOString().slice(0, 7).replace("-", "");

/**
 * Validate + persist an uploaded image file. Produces:
 *  - full: web-optimised JPEG (max ~1800px) stored under uploads/full/<yyyymm>/<id>.jpg
 *  - thumb: ~600px square crop under uploads/thumb/<yyyymm>/<id>.jpg
 * Registers the record in `uploads` and returns it.
 */
export async function persistImage(
  file: Express.Multer.File,
  ownerId: string,
  purpose: "listing" | "avatar" | "event",
): Promise<{ id: string; fullUrl: string; thumbUrl: string; width: number; height: number }> {
  const mime = file.mimetype;
  if (!UPLOAD_MIME_WHITELIST.has(mime)) {
    throw HttpError.badRequest("unsupported_image_type", "Only JPG, PNG, WEBP or GIF images are allowed.");
  }
  if (file.size > config.maxUploadBytes) {
    throw HttpError.badRequest("image_too_large", `Images must be under ${Math.round(config.maxUploadBytes / 1024 / 1024)}MB.`);
  }

  let img = sharp(file.buffer, { limitInputPixels: 50_000_000 }).rotate(); // honour EXIF orientation
  const meta = await img.metadata().catch(() => null);
  if (!meta || !meta.width || !meta.height) {
    throw HttpError.badRequest("unreadable_image", "That image could not be read. Try another file.");
  }

  if (meta.format === "gif" && purpose !== "avatar") {
    // keep as-is (small gifs only) — convert otherwise
    if (file.size > 2_000_000) throw HttpError.badRequest("gif_too_large", "Animated images must be under 2MB.");
    img = img; // passthrough later
  }

  const id = crypto.randomUUID();
  const fullDir = path.join(config.uploadRoot, "full", YEAR_MONTH);
  const thumbDir = path.join(config.uploadRoot, "thumb", YEAR_MONTH);
  const fs = await import("node:fs");
  fs.mkdirSync(fullDir, { recursive: true });
  fs.mkdirSync(thumbDir, { recursive: true });

  const fullKey = `full/${YEAR_MONTH}/${id}.jpg`;
  const thumbKey = `thumb/${YEAR_MONTH}/${id}.jpg`;
  const fullPath = path.join(config.uploadRoot, fullKey);
  const thumbPath = path.join(config.uploadRoot, thumbKey);

  let width = meta.width;
  let height = meta.height;

  if (meta.format === "gif" && purpose === "avatar") {
    // animated avatar — just keep original bytes (rare)
    await import("node:fs/promises").then((fsp) => fsp.writeFile(fullPath, file.buffer));
    await import("node:fs/promises").then((fsp) => fsp.writeFile(thumbPath, file.buffer));
  } else {
    const pipeline = sharp(file.buffer, { limitInputPixels: 50_000_000 }).rotate();
    const maxDim = 1800;
    const scale = Math.min(1, maxDim / Math.max(meta.width, meta.height));
    const resized = pipeline.resize({ width: Math.round(meta.width * scale), height: Math.round(meta.height * scale), fit: "inside", withoutEnlargement: true });
    await resized
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: 82, mozjpeg: true, progressive: true })
      .toFile(fullPath);
    const cover = sharp(file.buffer, { limitInputPixels: 50_000_000 }).rotate();
    const out = await cover
      .resize(600, 600, { fit: "cover", position: "attention" })
      .jpeg({ quality: 78, mozjpeg: true })
      .toBuffer();
    await import("node:fs/promises").then((fsp) => fsp.writeFile(thumbPath, out));
    const m = await sharp(out).metadata();
    width = m.width ?? 600;
    height = m.height ?? 600;
    if (meta.width && meta.height) {
      // keep original orientation dims for the "full" file for later use
    }
  }

  const originalName = Buffer.from(file.originalname || "image.jpg", "latin1").toString("utf8").slice(0, 255);
  const row = await queryOne<{ id: string }>(
    `INSERT INTO uploads (owner_id, purpose, original_name, mime, size_bytes, full_key, thumb_key, width, height)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
    [ownerId, purpose, originalName, mime === "image/jpg" ? "image/jpeg" : mime, file.size, fullKey, thumbKey, width, height],
  );

  // Origin-relative URLs: browser hits the same host (dev: Vite proxy; prod: single origin).
  return {
    id: row!.id,
    fullUrl: `/uploads/${fullKey}`,
    thumbUrl: `/uploads/${thumbKey}`,
    width,
    height,
  };
}

/** Attach uploaded media ids as a one-shot mutation (marks uploads as attached). */
export async function markUploadsAttached(ids: string[], ownerId: string): Promise<void> {
  if (!ids.length) return;
  await query(
    `UPDATE uploads SET attached = TRUE WHERE id = ANY($1::uuid[]) AND owner_id = $2 AND purpose IN ('listing','event')`,
    [ids, ownerId],
  );
}

/** Delete upload rows + files (used when a draft/listing is deleted). */
export async function deleteUploadsByIds(ids: string[], ownerId?: string): Promise<void> {
  if (!ids.length) return;
  const where = ownerId ? `AND owner_id = $2` : "";
  const rows = await query<{ full_key: string; thumb_key: string }>(
    `SELECT full_key, thumb_key FROM uploads WHERE id = ANY($1::uuid[]) ${where}`, ownerId ? [ids, ownerId] : [ids]);
  if (!rows.length) return;
  const fsp = await import("node:fs/promises");
  await Promise.all(
    rows.flatMap((r) =>
      [r.full_key, r.thumb_key].filter(Boolean).map((k) =>
        fsp.unlink(path.join(config.uploadRoot, k)).catch(() => undefined),
      ),
    ),
  );
  await query(`DELETE FROM uploads WHERE id = ANY($1::uuid[]) ${where}`, ownerId ? [ids, ownerId] : [ids]);
}

/** Absolute base for anything that truly needs one (emails, webhooks). */
export function mediaBase(): string {
  return config.publicBaseUrl.replace(/\/$/, "");
}

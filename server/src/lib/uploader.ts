import multer from "multer";
import { config } from "../config.js";
import { HttpError } from "../lib/errors.js";

/**
 * Memory storage: files are validated + reprocessed by sharp in lib/images.ts.
 * Buffers are released after each request; nothing stays in memory between calls.
 */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.maxUploadBytes,
    files: config.maxFilesPerRequest,
  },
  fileFilter: (_req, file, cb) => {
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.mimetype)) {
      cb(HttpError.badRequest("unsupported_image_type", "Only JPG, PNG, WEBP or GIF images are allowed."));
      return;
    }
    cb(null, true);
  },
});

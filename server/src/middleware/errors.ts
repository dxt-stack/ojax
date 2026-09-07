import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import { HttpError } from "../lib/errors.js";
import { logger } from "../lib/logger.js";

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(HttpError.notFound(`No endpoint at ${req.method} ${req.originalUrl}`));
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const isHttpError = err instanceof HttpError;
  const isMulterError = err instanceof multer.MulterError;
  const status = isHttpError ? err.status : isMulterError ? 400 : 500;
  const code = isHttpError ? err.code : isMulterError ? `upload_${err.code.toLowerCase()}` : "internal_error";
  const message = isHttpError
    ? err.message
    : isMulterError
      ? uploadMessage(err)
      : "Something went wrong on our side.";

  if (status >= 500) {
    logger.error(`[500] ${req.method} ${req.originalUrl}`, err);
  } else {
    logger.warn(`[${status}] ${req.method} ${req.originalUrl} — ${code}: ${message}`);
  }

  res.status(status).json({
    error: {
      code,
      message,
      ...(isHttpError && err.details !== undefined ? { details: err.details } : {}),
    },
  });
}

function uploadMessage(err: multer.MulterError): string {
  if (err.code === "LIMIT_FILE_SIZE") return "The uploaded file is too large.";
  if (err.code === "LIMIT_FILE_COUNT" || err.code === "LIMIT_UNEXPECTED_FILE") return "Too many files were uploaded.";
  return "The uploaded file could not be processed.";
}

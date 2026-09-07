import { config } from "../config.js";

type Level = "debug" | "info" | "warn" | "error";

function ts(): string {
  return new Date().toISOString();
}

function fmt(level: Level, msg: string, extra?: unknown): string {
  const base = `${ts()} [${level.toUpperCase()}] ${msg}`;
  if (extra === undefined) return base;
  if (typeof extra === "string") return `${base} ${extra}`;
  try {
    return `${base} ${JSON.stringify(extra)}`;
  } catch {
    return base;
  }
}

export const logger = {
  debug(msg: string, extra?: unknown) {
    if (config.isProd) return;
    console.log(fmt("debug", msg, extra));
  },
  info(msg: string, extra?: unknown) {
    console.log(fmt("info", msg, extra));
  },
  warn(msg: string, extra?: unknown) {
    console.warn(fmt("warn", msg, extra));
  },
  error(msg: string, extra?: unknown) {
    console.error(fmt("error", msg, extra));
  },
};

export function requestLog(req: { method: string; originalUrl: string }, status: number, ms: number) {
  logger.debug(`${req.method} ${req.originalUrl} -> ${status} (${ms}ms)`);
}

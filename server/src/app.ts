import express from "express";
import type { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import path from "node:path";
import fs from "node:fs";
import { config } from "./config.js";
import { authRouter } from "./routes/auth.js";
import { usersRouter } from "./routes/users.js";
import { listingsRouter } from "./routes/listings.js";
import { ordersRouter } from "./routes/orders.js";
import { messagesRouter } from "./routes/messages.js";
import { eventsRouter } from "./routes/events.js";
import { notificationsRouter, uploadsRouter } from "./routes/misc.js";
import { reviewsRouter } from "./routes/reviews.js";
import { metaRouter } from "./routes/meta.js";
import { notFoundHandler, errorHandler } from "./middleware/errors.js";
import { optionalAuth } from "./middleware/auth.js";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  if (config.trustProxy) app.set("trust proxy", 1);

  app.use(helmet({
    contentSecurityPolicy: config.isProd ? undefined : false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }));
  app.use(compression());
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());

  const allowedOrigins = config.clientOrigin.split(",").map((s) => s.trim()).filter(Boolean);
  app.use(cors({
    origin: allowedOrigins.length ? allowedOrigins : false,
    credentials: true,
  }));

  const apiLimiter = rateLimit({
    windowMs: 60_000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => ["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(req.ip || ""),
  });
  app.use("/api", apiLimiter);

  // health
  app.get("/healthz", (_req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.json({ ok: true, name: "ojax-api", env: config.env, time: new Date().toISOString() });
  });

  // static media (user uploads). Immutable-ish long cache for thumbnails.
  const uploadsDir = path.resolve(config.uploadRoot);
  app.use("/uploads/full", express.static(path.join(uploadsDir, "full"), {
    maxAge: "7d", immutable: true, fallthrough: true,
  }));
  app.use("/uploads/thumb", express.static(path.join(uploadsDir, "thumb"), {
    maxAge: "30d", immutable: true, fallthrough: true,
  }));

  // API routes
  app.use("/api/auth", authRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/listings", optionalAuth, listingsRouter);
  app.use("/api/orders", ordersRouter);
  app.use("/api/messages", messagesRouter);
  app.use("/api/events", eventsRouter);
  app.use("/api/notifications", notificationsRouter);
  app.use("/api/reviews", reviewsRouter);
  app.use("/api/uploads", uploadsRouter);
  app.use("/api/meta", metaRouter);

  // ---- production: serve built client + SPA fallback ----
  const staticDir = process.env.STATIC_DIR || path.resolve(config.isTest ? process.cwd() : path.join(process.cwd(), "..", "client", "dist"));
  if (!config.isTest && fs.existsSync(staticDir)) {
    app.use(express.static(staticDir, { maxAge: config.isProd ? "1d" : 0, index: "index.html" }));
    app.get(/^(?!\/api|\/uploads|\/healthz).*/u, (_req, res) => {
      res.sendFile(path.join(staticDir, "index.html"));
    });
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

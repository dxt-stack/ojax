import dotenv from "dotenv";
import path from "node:path";
import fs from "node:fs";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

function int(v: string | undefined, dflt: number): number {
  if (!v) return dflt;
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : dflt;
}

function bool(v: string | undefined, dflt = false): boolean {
  if (v == null) return dflt;
  return ["1", "true", "yes", "on"].includes(v.trim().toLowerCase());
}

const uploadRootDefault = path.resolve(process.cwd(), "uploads");
const env = process.env.NODE_ENV || "development";
const isProd = env === "production";
const isTest = env === "test";

export const config = {
  env,
  isProd,
  isTest,

  host: process.env.HOST || "0.0.0.0",
  port: int(process.env.PORT, 4000),

  databaseUrl:
    process.env.DATABASE_URL ||
    "postgres://ojax:ojax_dev_pass@127.0.0.1:5432/ojax",

  // Keep local development convenient, but never allow wildcard credentialed CORS in production.
  clientOrigin: process.env.CLIENT_ORIGIN || (isProd ? "" : "http://localhost:5173"),

  jwtSecret: process.env.JWT_SECRET || (isProd ? "" : "ojax-dev-secret-change-me"),
  accessTokenTtlSec: int(process.env.ACCESS_TOKEN_TTL_SEC, 60 * 12),
  refreshTokenTtlDays: int(process.env.REFRESH_TOKEN_TTL_DAYS, 30),

  // Uploads
  uploadRoot: process.env.UPLOAD_ROOT || uploadRootDefault,
  maxUploadBytes: int(process.env.MAX_UPLOAD_BYTES, 10 * 1024 * 1024),
  maxFilesPerRequest: int(process.env.MAX_FILES_PER_REQUEST, 8),

  // Business rules (money in kobo — 100 kobo = ₦1)
  currency: "NGN",
  shippingFeeKobo: int(process.env.SHIPPING_FEE_KOBO, 250000),
  freeShippingAboveKobo: int(process.env.FREE_SHIPPING_ABOVE_KOBO, 2000000),
  serviceFeeRatePercent: Number(process.env.SERVICE_FEE_RATE_PERCENT || "0"),
  maxListingPhotos: int(process.env.MAX_LISTING_PHOTOS, 8),
  checkoutHoldMinutes: int(process.env.CHECKOUT_HOLD_MINUTES, 90),

  // Payments
  gatewayMode: (process.env.PAYMENT_GATEWAY || "sandbox") as "sandbox" | "paystack",
  paystackSecretKey: process.env.PAYSTACK_SECRET_KEY || "",
  paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY || "",

  // Comms (dev logs instead of sending)
  smtp: {
    host: process.env.SMTP_HOST || "",
    port: int(process.env.SMTP_PORT, 587),
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from: process.env.SMTP_FROM || "OjaX <hello@ojax.app>",
  },
  publicBaseUrl: process.env.PUBLIC_BASE_URL || "http://localhost:4000",

  // Misc
  demoSeeding: process.env.DEMO_SEED == null ? !isProd : bool(process.env.DEMO_SEED),
  trustProxy: bool(process.env.TRUST_PROXY, false),
} as const;

export function validateConfig() {
  const errors: string[] = [];
  if (!config.isTest && config.isProd) {
    if (config.jwtSecret.length < 32) errors.push("JWT_SECRET must be at least 32 characters in production.");
    if (!config.clientOrigin) errors.push("CLIENT_ORIGIN must be set in production.");
    if (config.clientOrigin.split(",").some((origin) => origin.trim() === "*")) {
      errors.push("CLIENT_ORIGIN cannot be wildcard in production.");
    }
    if (config.demoSeeding) errors.push("DEMO_SEED must be false in production.");
    if (config.gatewayMode === "paystack" && (!config.paystackSecretKey || !config.paystackPublicKey)) {
      errors.push("Paystack keys are required when PAYMENT_GATEWAY=paystack.");
    }
  }
  if (config.gatewayMode !== "sandbox" && config.gatewayMode !== "paystack") {
    errors.push("PAYMENT_GATEWAY must be sandbox or paystack.");
  }
  if (errors.length) throw new Error(`Invalid OjaX configuration:\n- ${errors.join("\n- ")}`);
}

// Create upload root (and common subdirs) up-front so runtime never races on it.
for (const sub of ["", "full", "thumb"]) {
  const dir = sub ? path.join(config.uploadRoot, sub) : config.uploadRoot;
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

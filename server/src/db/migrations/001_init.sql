-- OjaX schema v1 — idempotent (safe to run repeatedly)

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================ users
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT NOT NULL,
  password_hash   TEXT NOT NULL,
  full_name       TEXT NOT NULL,
  role            TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student','admin')),
  is_org          BOOLEAN NOT NULL DEFAULT FALSE,
  org_name        TEXT,
  avatar_url      TEXT,
  university_code TEXT,
  department      TEXT,
  level           TEXT,
  phone           TEXT,
  whatsapp        TEXT,
  bio             TEXT NOT NULL DEFAULT '',
  meetup_spot     TEXT,
  verified        BOOLEAN NOT NULL DEFAULT FALSE,
  email_verified  BOOLEAN NOT NULL DEFAULT FALSE,
  onboarded       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_email ON users (lower(email)) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS ix_users_university ON users (university_code) WHERE deleted_at IS NULL;

-- Refresh-token families (rotation + revocation).
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  family_id  UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  user_agent TEXT
);
CREATE INDEX IF NOT EXISTS ix_refresh_user ON refresh_tokens (user_id, revoked_at);

CREATE TABLE IF NOT EXISTS email_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind       TEXT NOT NULL, -- 'verify_email' | 'reset_password'
  token_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at    TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS ix_email_tokens_user ON email_tokens (user_id, kind, used_at);

-- ============================================================ uploads
CREATE TABLE IF NOT EXISTS uploads (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purpose       TEXT NOT NULL CHECK (purpose IN ('listing','avatar','event','message')),
  original_name TEXT NOT NULL,
  mime          TEXT NOT NULL,
  size_bytes    BIGINT NOT NULL,
  full_key      TEXT NOT NULL,   -- uploads/full/202509/<id>.jpg (relative to upload root)
  thumb_key     TEXT,            -- uploads/thumb/202509/<id>.jpg (square-ish crop)
  width         INT,
  height        INT,
  attached      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_uploads_owner ON uploads (owner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS ix_uploads_orphan ON uploads (created_at) WHERE attached = FALSE;

-- ============================================================ listings
CREATE TABLE IF NOT EXISTS listings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT NOT NULL DEFAULT '',
  category        TEXT NOT NULL,
  subcategory     TEXT,
  condition_code  TEXT NOT NULL DEFAULT 'used-good',
  price_kobo      BIGINT NOT NULL CHECK (price_kobo >= 0),
  negotiable      BOOLEAN NOT NULL DEFAULT FALSE,
  quantity        INT NOT NULL DEFAULT 1 CHECK (quantity BETWEEN 1 AND 999),
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','sold','deleted')),
  ship_available  BOOLEAN NOT NULL DEFAULT FALSE,
  meetup_location TEXT,
  meetup_notes    TEXT,
  views           INT NOT NULL DEFAULT 0,
  is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  sold_at         TIMESTAMPTZ,
  sold_price_kobo BIGINT,
  buyer_id        UUID REFERENCES users(id) ON DELETE SET NULL,
  deleted_at      TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS ix_listings_active ON listings (status, created_at DESC) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS ix_listings_cat ON listings (category, created_at DESC) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS ix_listings_price ON listings (price_kobo) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS ix_listings_seller ON listings (seller_id, created_at DESC);
CREATE INDEX IF NOT EXISTS ix_listings_search ON listings USING gin (
  (title || ' ' || coalesce(description,'')) gin_trgm_ops
) WHERE status = 'active' AND deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS listing_images (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  upload_id  UUID NOT NULL REFERENCES uploads(id) ON DELETE CASCADE,
  position   INT NOT NULL DEFAULT 0,
  UNIQUE (listing_id, position),
  UNIQUE (upload_id)
);

CREATE TABLE IF NOT EXISTS favorites (
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, listing_id)
);

-- ============================================================ cart
CREATE TABLE IF NOT EXISTS cart_items (
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  quantity   INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, listing_id)
);

-- ============================================================ orders
CREATE TABLE IF NOT EXISTS orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_no         TEXT NOT NULL UNIQUE,
  buyer_id         UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status           TEXT NOT NULL DEFAULT 'pending_payment'
                   CHECK (status IN ('pending_payment','paid','processing','completed','cancelled')),
  fulfilment       TEXT NOT NULL CHECK (fulfilment IN ('pickup','shipping')),
  subtotal_kobo    BIGINT NOT NULL,
  shipping_kobo    BIGINT NOT NULL DEFAULT 0,
  service_fee_kobo BIGINT NOT NULL DEFAULT 0,
  total_kobo       BIGINT NOT NULL,
  currency         TEXT NOT NULL DEFAULT 'NGN',
  contact_name     TEXT NOT NULL,
  contact_phone    TEXT NOT NULL,
  delivery_address TEXT,
  campus_note      TEXT,
  buyer_note       TEXT,
  payment_method   TEXT NOT NULL DEFAULT 'online',
  paid_at          TIMESTAMPTZ,
  cancelled_at     TIMESTAMPTZ,
  completed_at     TIMESTAMPTZ,
  reserved_until   TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_orders_buyer ON orders (buyer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS ix_orders_status ON orders (status, created_at DESC);

CREATE TABLE IF NOT EXISTS order_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  listing_id    UUID NOT NULL,
  seller_id     UUID NOT NULL,
  title_snapshot TEXT NOT NULL,
  image_snapshot TEXT,          -- cover thumb url
  unit_price_kobo BIGINT NOT NULL,
  quantity      INT NOT NULL,
  meetup_location TEXT
);
CREATE INDEX IF NOT EXISTS ix_order_items_order ON order_items (order_id);
CREATE INDEX IF NOT EXISTS ix_order_items_seller ON order_items (seller_id, id DESC);

CREATE TABLE IF NOT EXISTS order_events (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  to_status  TEXT NOT NULL,
  note       TEXT,
  actor_id   UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payer_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider    TEXT NOT NULL,           -- 'ojapay' sandbox | 'paystack'
  reference   TEXT NOT NULL UNIQUE,
  amount_kobo BIGINT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'started' CHECK (status IN ('started','success','failed','abandoned')),
  meta        JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at     TIMESTAMPTZ
);

-- ============================================================ conversations / messages
CREATE TABLE IF NOT EXISTS conversations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  listing_title_snapshot TEXT,
  cover_snapshot TEXT,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_conversations_updated ON conversations (updated_at DESC);

CREATE TABLE IF NOT EXISTS conversation_members (
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_read_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body            TEXT NOT NULL,
  kind            TEXT NOT NULL DEFAULT 'text' CHECK (kind IN ('text','system')),
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_messages_conv ON messages (conversation_id, created_at);

-- ============================================================ events
CREATE TABLE IF NOT EXISTS events (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  description      TEXT NOT NULL DEFAULT '',
  category         TEXT NOT NULL DEFAULT 'socials',
  starts_at        TIMESTAMPTZ NOT NULL,
  ends_at          TIMESTAMPTZ,
  venue            TEXT NOT NULL,
  university_code  TEXT,
  city             TEXT NOT NULL DEFAULT 'Lagos',
  is_online        BOOLEAN NOT NULL DEFAULT FALSE,
  online_url       TEXT,
  poster_upload_id UUID REFERENCES uploads(id) ON DELETE SET NULL,
  poster_url       TEXT, -- allow pre-hosted posters (e.g. /seed/...)
  capacity         INT CHECK (capacity IS NULL OR capacity > 0),
  price_kobo       BIGINT NOT NULL DEFAULT 0,
  status           TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft','published','cancelled')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_events_starts ON events (starts_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS ix_events_org ON events (org_id, starts_at DESC);

CREATE TABLE IF NOT EXISTS event_rsvps (
  event_id   UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (event_id, user_id)
);

-- ============================================================ notifications
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind       TEXT NOT NULL, -- message | order | listing | event | system
  title      TEXT NOT NULL,
  body       TEXT NOT NULL DEFAULT '',
  link       TEXT,
  read_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_notifications_user ON notifications (user_id, read_at, created_at DESC);

-- ============================================================ views journal (analytics-lite)
CREATE TABLE IF NOT EXISTS listing_view_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  viewer_id   UUID,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_lve_listing ON listing_view_events (listing_id);

-- updated_at helper
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_listings_updated ON listings;
CREATE TRIGGER trg_listings_updated BEFORE UPDATE ON listings
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_cart_updated ON cart_items;
CREATE TRIGGER trg_cart_updated BEFORE UPDATE ON cart_items
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_conv_updated ON conversations;
CREATE TRIGGER trg_conv_updated BEFORE UPDATE ON conversations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

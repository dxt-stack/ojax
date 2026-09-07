-- OjaX v1.1 — reviews & seller ratings (only real, post-delivery reviews by buyers)

CREATE TABLE IF NOT EXISTS listing_reviews (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id UUID NOT NULL UNIQUE REFERENCES order_items(id) ON DELETE CASCADE,
  buyer_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating        INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_reviews_seller ON listing_reviews (seller_id, created_at DESC);
CREATE INDEX IF NOT EXISTS ix_reviews_buyer  ON listing_reviews (buyer_id, created_at DESC);

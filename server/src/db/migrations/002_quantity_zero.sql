-- Allow 0 stock: when the last unit of an item is reserved for an order,
-- quantity drops to 0 and the listing auto-pauses until cancelled/restored.
ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_quantity_check;
ALTER TABLE listings ADD CONSTRAINT listings_quantity_check CHECK (quantity BETWEEN 0 AND 999);

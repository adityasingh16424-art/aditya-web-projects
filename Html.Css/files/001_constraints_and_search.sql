-- BLACK ROBINE — constraints and search indexes that Prisma cannot express.
--
-- Apply as a custom migration AFTER the initial migration:
--   npx prisma migrate dev --create-only --name constraints_and_search
--   (paste this file into the generated migration.sql, then)
--   npx prisma migrate dev
--
-- These are the last line of defence against overselling and bad data;
-- the service layer validates first, the database refuses anyway.

-- ── Inventory: never negative, never reserve more than is on hand ──────────
ALTER TABLE "Inventory"
  ADD CONSTRAINT inventory_quantity_nonneg   CHECK ("quantity" >= 0),
  ADD CONSTRAINT inventory_reserved_nonneg   CHECK ("reserved" >= 0),
  ADD CONSTRAINT inventory_reserved_lte_qty  CHECK ("reserved" <= "quantity");

-- ── Pricing sanity ─────────────────────────────────────────────────────────
ALTER TABLE "ProductVariant"
  ADD CONSTRAINT variant_price_valid CHECK ("price" >= 0 AND "mrp" >= "price");

ALTER TABLE "CartItem"
  ADD CONSTRAINT cartitem_quantity_positive CHECK ("quantity" > 0);

ALTER TABLE "OrderItem"
  ADD CONSTRAINT orderitem_quantity_positive CHECK ("quantity" > 0);

ALTER TABLE "Order"
  ADD CONSTRAINT order_amounts_nonneg CHECK ("subtotal" >= 0 AND "grandTotal" >= 0);

ALTER TABLE "Coupon"
  ADD CONSTRAINT coupon_percent_range
  CHECK ("discountType" <> 'PERCENTAGE' OR ("discountValue" BETWEEN 1 AND 100));

-- ── Reviews ────────────────────────────────────────────────────────────────
ALTER TABLE "Review"
  ADD CONSTRAINT review_rating_range CHECK ("rating" BETWEEN 1 AND 5);

-- ── Search: trigram indexes for name / brand / SKU / category / suggestions ─
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX product_name_trgm_idx     ON "Product"        USING gin ("name"  gin_trgm_ops);
CREATE INDEX brand_name_trgm_idx       ON "Brand"          USING gin ("name"  gin_trgm_ops);
CREATE INDEX category_name_trgm_idx    ON "Category"       USING gin ("name"  gin_trgm_ops);
CREATE INDEX variant_sku_trgm_idx      ON "ProductVariant" USING gin ("sku"   gin_trgm_ops);
CREATE INDEX searchterm_term_trgm_idx  ON "SearchTerm"     USING gin ("term"  gin_trgm_ops);

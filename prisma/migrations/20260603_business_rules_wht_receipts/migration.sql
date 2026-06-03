-- Organization-level WHT configuration
ALTER TABLE "organizations"
ADD COLUMN IF NOT EXISTS "is_withholding_agent" BOOLEAN NOT NULL DEFAULT false;

-- Snapshot line type for historical WHT calculations.
ALTER TABLE "sales_invoice_lines"
ADD COLUMN IF NOT EXISTS "line_type" "ItemType";

UPDATE "sales_invoice_lines" AS line
SET "line_type" = CASE
  WHEN invoice."goods_or_service" = 'Service' THEN 'Service'::"ItemType"
  ELSE 'Good'::"ItemType"
END
FROM "sales_invoices" AS invoice
WHERE line."invoice_id" = invoice."id";

ALTER TABLE "sales_invoice_lines"
ALTER COLUMN "line_type" SET DEFAULT 'Good',
ALTER COLUMN "line_type" SET NOT NULL;

ALTER TABLE "purchase_bill_lines"
ADD COLUMN IF NOT EXISTS "line_type" "ItemType" NOT NULL DEFAULT 'Good';

-- Purchase WHT exception audit text.
ALTER TABLE "purchase_bills"
ADD COLUMN IF NOT EXISTS "withholding_override_reason" TEXT;

-- Receipt numbers.
ALTER TABLE "payments"
ADD COLUMN IF NOT EXISTS "advance_receipt_number" TEXT;

-- Normalize legacy receipt values before enforcing uniqueness. PostgreSQL
-- unique indexes allow multiple NULLs, but blank strings are duplicate values.
UPDATE "sales_invoices"
SET "fiscal_receipt_number" = NULL
WHERE "fiscal_receipt_number" IS NOT NULL
  AND btrim("fiscal_receipt_number") = '';

UPDATE "sales_invoices"
SET "fiscal_receipt_number" = btrim("fiscal_receipt_number")
WHERE "fiscal_receipt_number" IS NOT NULL;

DO $$
DECLARE
  duplicate_receipts TEXT;
BEGIN
  SELECT string_agg(
    format(
      'org_id=%s fiscal_receipt_number=%s count=%s invoices=%s',
      "org_id",
      "fiscal_receipt_number",
      duplicate_count,
      invoice_numbers
    ),
    E'\n'
  )
  INTO duplicate_receipts
  FROM (
    SELECT
      "org_id",
      "fiscal_receipt_number",
      COUNT(*) AS duplicate_count,
      string_agg("number", ', ' ORDER BY "created_at") AS invoice_numbers
    FROM "sales_invoices"
    WHERE "fiscal_receipt_number" IS NOT NULL
    GROUP BY "org_id", "fiscal_receipt_number"
    HAVING COUNT(*) > 1
  ) duplicates;

  IF duplicate_receipts IS NOT NULL THEN
    RAISE EXCEPTION
      'Duplicate fiscal receipt numbers exist. Correct these production invoices before enforcing uniqueness:%',
      E'\n' || duplicate_receipts;
  END IF;
END $$;

UPDATE "payments"
SET "advance_receipt_number" = NULL
WHERE "advance_receipt_number" IS NOT NULL
  AND btrim("advance_receipt_number") = '';

UPDATE "payments"
SET "advance_receipt_number" = btrim("advance_receipt_number")
WHERE "advance_receipt_number" IS NOT NULL;

DO $$
DECLARE
  duplicate_receipts TEXT;
BEGIN
  SELECT string_agg(
    format(
      'org_id=%s advance_receipt_number=%s count=%s payments=%s',
      "org_id",
      "advance_receipt_number",
      duplicate_count,
      payment_ids
    ),
    E'\n'
  )
  INTO duplicate_receipts
  FROM (
    SELECT
      "org_id",
      "advance_receipt_number",
      COUNT(*) AS duplicate_count,
      string_agg("id"::text, ', ' ORDER BY "created_at") AS payment_ids
    FROM "payments"
    WHERE "advance_receipt_number" IS NOT NULL
    GROUP BY "org_id", "advance_receipt_number"
    HAVING COUNT(*) > 1
  ) duplicates;

  IF duplicate_receipts IS NOT NULL THEN
    RAISE EXCEPTION
      'Duplicate advance receipt numbers exist. Correct these production payments before enforcing uniqueness:%',
      E'\n' || duplicate_receipts;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "sales_invoices_org_fiscal_receipt_number_key"
ON "sales_invoices"("org_id", "fiscal_receipt_number")
WHERE "fiscal_receipt_number" IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "payments_org_advance_receipt_number_key"
ON "payments"("org_id", "advance_receipt_number")
WHERE "advance_receipt_number" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "payments_org_related_idx"
ON "payments"("org_id", "related_type", "related_id");

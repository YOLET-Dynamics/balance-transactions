ALTER TYPE "DocType" ADD VALUE 'PI';

CREATE TYPE "InvoiceKind" AS ENUM ('Invoice', 'Proforma');

ALTER TABLE "sales_invoices" ADD COLUMN "kind" "InvoiceKind" NOT NULL DEFAULT 'Invoice';

CREATE INDEX "sales_invoices_kind_idx" ON "sales_invoices"("kind");
CREATE INDEX "sales_invoices_org_id_kind_idx" ON "sales_invoices"("org_id", "kind");


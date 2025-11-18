-- CreateEnum
CREATE TYPE "InvoiceType" AS ENUM ('Cash', 'Credit');

-- AlterTable
ALTER TABLE "sales_invoices" 
ADD COLUMN "invoice_type" "InvoiceType" NOT NULL DEFAULT 'Cash',
ADD COLUMN "invoice_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "due_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "paid_date" TIMESTAMP(3);

-- Set due_date = invoice_date for existing records
UPDATE "sales_invoices" SET "invoice_date" = "created_at", "due_date" = "created_at";


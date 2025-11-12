-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('Draft', 'Pending', 'Paid', 'Overdue', 'Cancelled');

-- AlterTable
ALTER TABLE "sales_invoices" ADD COLUMN "status" "InvoiceStatus" NOT NULL DEFAULT 'Pending';


-- Add status column to purchase_bills table
ALTER TABLE "purchase_bills" 
ADD COLUMN "status" "InvoiceStatus" NOT NULL DEFAULT 'Pending';


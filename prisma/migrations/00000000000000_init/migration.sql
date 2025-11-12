-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('Owner', 'Admin', 'Manager', 'Staff', 'Viewer');

-- CreateEnum
CREATE TYPE "PartyType" AS ENUM ('Company', 'Individual');

-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('Good', 'Service');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('Cash', 'Cheque', 'BankTransfer', 'POS', 'Mobile');

-- CreateEnum
CREATE TYPE "GoodsOrService" AS ENUM ('Goods', 'Service');

-- CreateEnum
CREATE TYPE "PaymentDirection" AS ENUM ('Incoming', 'Outgoing');

-- CreateEnum
CREATE TYPE "RelatedType" AS ENUM ('Invoice', 'Bill', 'None');

-- CreateEnum
CREATE TYPE "AttachmentKind" AS ENUM ('SalesPDF', 'PaymentPDF', 'PurchasePDF', 'Logo', 'Other');

-- CreateEnum
CREATE TYPE "DocType" AS ENUM ('CS', 'PV', 'PB');

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateTable
CREATE TABLE "organizations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" TEXT NOT NULL,
    "legal_name" TEXT NOT NULL,
    "trade_name" TEXT,
    "logo_attachment_id" UUID,
    "subcity" TEXT,
    "city_region" TEXT,
    "country" TEXT NOT NULL DEFAULT 'ET',
    "tin" TEXT,
    "vat_number" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "default_currency" TEXT NOT NULL DEFAULT 'ETB',
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "phone" TEXT,
    "is_email_verified" BOOLEAN NOT NULL DEFAULT false,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memberships" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "org_id" UUID NOT NULL,
    "role" "MemberRole" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "invited_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accepted_at" TIMESTAMP(3),

    CONSTRAINT "memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "org_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "ip" TEXT,
    "user_agent" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_verification_tokens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_verification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "org_id" UUID NOT NULL,
    "type" "PartyType" NOT NULL,
    "legal_name" TEXT,
    "trade_name" TEXT,
    "subcity" TEXT,
    "city_region" TEXT,
    "country" TEXT NOT NULL DEFAULT 'ET',
    "tin" TEXT,
    "vat_number" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "contact_person" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendors" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "org_id" UUID NOT NULL,
    "type" "PartyType" NOT NULL,
    "legal_name" TEXT,
    "trade_name" TEXT,
    "subcity" TEXT,
    "city_region" TEXT,
    "country" TEXT NOT NULL DEFAULT 'ET',
    "tin" TEXT,
    "vat_number" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "contact_person" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "org_id" UUID NOT NULL,
    "type" "ItemType" NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "unit" TEXT NOT NULL,
    "sku" TEXT,
    "barcode" TEXT,
    "default_price" DECIMAL(19,2) NOT NULL,
    "vat_applicable" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_rates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "org_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "rate_pct" DECIMAL(5,2) NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_invoices" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "org_id" UUID NOT NULL,
    "number" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "seq_value" INTEGER NOT NULL,
    "buyer_type" "PartyType",
    "buyer_legal_name" TEXT,
    "buyer_trade_name" TEXT,
    "buyer_subcity" TEXT,
    "buyer_city_region" TEXT,
    "buyer_country" TEXT,
    "buyer_tin" TEXT,
    "buyer_vat_number" TEXT,
    "buyer_phone" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'ETB',
    "subtotal" DECIMAL(19,2) NOT NULL,
    "vat_amount" DECIMAL(19,2) NOT NULL,
    "total" DECIMAL(19,2) NOT NULL,
    "total_in_words" TEXT NOT NULL,
    "goods_or_service" "GoodsOrService" NOT NULL,
    "withheld_pct" DECIMAL(5,2),
    "withheld_amount" DECIMAL(19,2),
    "net_payable" DECIMAL(19,2) NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL,
    "payment_ref" TEXT,
    "created_by" TEXT,
    "reviewed_by" TEXT,
    "authorized_by" TEXT,
    "received_by" TEXT,
    "notes" TEXT,
    "pdf_attachment_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_invoice_lines" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "invoice_id" UUID NOT NULL,
    "seq" INTEGER NOT NULL,
    "item_id" UUID,
    "description" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "quantity" DECIMAL(19,4) NOT NULL,
    "unit_price" DECIMAL(19,2) NOT NULL,
    "line_total" DECIMAL(19,2) NOT NULL,
    "is_vat_applicable" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "sales_invoice_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_attachments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "invoice_id" UUID NOT NULL,
    "file_key" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "title" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sales_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_bills" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "org_id" UUID NOT NULL,
    "number" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "seq_value" INTEGER NOT NULL,
    "vendor_legal_name" TEXT,
    "vendor_trade_name" TEXT,
    "vendor_subcity" TEXT,
    "vendor_city_region" TEXT,
    "vendor_country" TEXT,
    "vendor_tin" TEXT,
    "vendor_vat_number" TEXT,
    "vendor_phone" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'ETB',
    "subtotal" DECIMAL(19,2) NOT NULL,
    "vat_amount" DECIMAL(19,2) NOT NULL,
    "total" DECIMAL(19,2) NOT NULL,
    "withheld_pct" DECIMAL(5,2),
    "withheld_amount" DECIMAL(19,2),
    "net_paid" DECIMAL(19,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL,
    "payment_ref" TEXT,
    "created_by" TEXT,
    "reviewed_by" TEXT,
    "authorized_by" TEXT,
    "pdf_attachment_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_bills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_bill_lines" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "bill_id" UUID NOT NULL,
    "seq" INTEGER NOT NULL,
    "item_id" UUID,
    "description" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "quantity" DECIMAL(19,4) NOT NULL,
    "unit_price" DECIMAL(19,2) NOT NULL,
    "discount_amount" DECIMAL(19,2) NOT NULL DEFAULT 0,
    "line_total" DECIMAL(19,2) NOT NULL,
    "is_vat_applicable" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "purchase_bill_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "org_id" UUID NOT NULL,
    "direction" "PaymentDirection" NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "amount" DECIMAL(19,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ETB',
    "related_type" "RelatedType" NOT NULL,
    "related_id" UUID,
    "voucher_pdf_id" UUID,
    "created_by" TEXT,
    "reviewed_by" TEXT,
    "authorized_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "org_id" UUID NOT NULL,
    "file_key" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "kind" "AttachmentKind" NOT NULL,
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "number_sequences" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "org_id" UUID NOT NULL,
    "doc_type" "DocType" NOT NULL,
    "year" INTEGER NOT NULL,
    "next_value" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "number_sequences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "org_id" UUID NOT NULL,
    "actor_user_id" UUID,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" UUID,
    "ip" TEXT,
    "user_agent" TEXT,
    "changes_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_code_key" ON "organizations"("code");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "memberships_org_id_idx" ON "memberships"("org_id");

-- CreateIndex
CREATE UNIQUE INDEX "memberships_user_id_org_id_key" ON "memberships"("user_id", "org_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_hash_key" ON "sessions"("token_hash");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "sessions_org_id_idx" ON "sessions"("org_id");

-- CreateIndex
CREATE INDEX "sessions_expires_at_idx" ON "sessions"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "email_verification_tokens_token_hash_key" ON "email_verification_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "email_verification_tokens_user_id_idx" ON "email_verification_tokens"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_hash_key" ON "password_reset_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens"("user_id");

-- CreateIndex
CREATE INDEX "customers_org_id_idx" ON "customers"("org_id");

-- CreateIndex
CREATE UNIQUE INDEX "customers_org_id_legal_name_key" ON "customers"("org_id", "legal_name");

-- CreateIndex
CREATE INDEX "vendors_org_id_idx" ON "vendors"("org_id");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_org_id_legal_name_key" ON "vendors"("org_id", "legal_name");

-- CreateIndex
CREATE INDEX "items_org_id_idx" ON "items"("org_id");

-- CreateIndex
CREATE UNIQUE INDEX "items_org_id_code_key" ON "items"("org_id", "code");

-- CreateIndex
CREATE INDEX "tax_rates_org_id_idx" ON "tax_rates"("org_id");

-- CreateIndex
CREATE UNIQUE INDEX "tax_rates_org_id_name_key" ON "tax_rates"("org_id", "name");

-- CreateIndex
CREATE INDEX "sales_invoices_org_id_idx" ON "sales_invoices"("org_id");

-- CreateIndex
CREATE INDEX "sales_invoices_year_idx" ON "sales_invoices"("year");

-- CreateIndex
CREATE UNIQUE INDEX "sales_invoices_org_id_number_key" ON "sales_invoices"("org_id", "number");

-- CreateIndex
CREATE INDEX "sales_invoice_lines_invoice_id_idx" ON "sales_invoice_lines"("invoice_id");

-- CreateIndex
CREATE INDEX "sales_attachments_invoice_id_idx" ON "sales_attachments"("invoice_id");

-- CreateIndex
CREATE INDEX "purchase_bills_org_id_idx" ON "purchase_bills"("org_id");

-- CreateIndex
CREATE INDEX "purchase_bills_year_idx" ON "purchase_bills"("year");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_bills_org_id_number_key" ON "purchase_bills"("org_id", "number");

-- CreateIndex
CREATE INDEX "purchase_bill_lines_bill_id_idx" ON "purchase_bill_lines"("bill_id");

-- CreateIndex
CREATE INDEX "payments_org_id_idx" ON "payments"("org_id");

-- CreateIndex
CREATE INDEX "attachments_org_id_idx" ON "attachments"("org_id");

-- CreateIndex
CREATE INDEX "number_sequences_org_id_idx" ON "number_sequences"("org_id");

-- CreateIndex
CREATE UNIQUE INDEX "number_sequences_org_id_doc_type_year_key" ON "number_sequences"("org_id", "doc_type", "year");

-- CreateIndex
CREATE INDEX "audit_logs_org_id_idx" ON "audit_logs"("org_id");

-- CreateIndex
CREATE INDEX "audit_logs_actor_user_id_idx" ON "audit_logs"("actor_user_id");

-- CreateIndex
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs"("entity");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_logo_attachment_id_fkey" FOREIGN KEY ("logo_attachment_id") REFERENCES "attachments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_rates" ADD CONSTRAINT "tax_rates_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_invoices" ADD CONSTRAINT "sales_invoices_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_invoices" ADD CONSTRAINT "sales_invoices_pdf_attachment_id_fkey" FOREIGN KEY ("pdf_attachment_id") REFERENCES "attachments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_invoice_lines" ADD CONSTRAINT "sales_invoice_lines_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "sales_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_invoice_lines" ADD CONSTRAINT "sales_invoice_lines_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_attachments" ADD CONSTRAINT "sales_attachments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "sales_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_bills" ADD CONSTRAINT "purchase_bills_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_bills" ADD CONSTRAINT "purchase_bills_pdf_attachment_id_fkey" FOREIGN KEY ("pdf_attachment_id") REFERENCES "attachments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_bill_lines" ADD CONSTRAINT "purchase_bill_lines_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "purchase_bills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_bill_lines" ADD CONSTRAINT "purchase_bill_lines_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_voucher_pdf_id_fkey" FOREIGN KEY ("voucher_pdf_id") REFERENCES "attachments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "number_sequences" ADD CONSTRAINT "number_sequences_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on tenant-scoped tables
ALTER TABLE "customers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "vendors" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tax_rates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sales_invoices" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "purchase_bills" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "attachments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "number_sequences" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies using app.org_id GUC
CREATE POLICY tenant_isolation ON "customers"
  USING (org_id::text = current_setting('app.org_id', true));

CREATE POLICY tenant_isolation ON "vendors"
  USING (org_id::text = current_setting('app.org_id', true));

CREATE POLICY tenant_isolation ON "items"
  USING (org_id::text = current_setting('app.org_id', true));

CREATE POLICY tenant_isolation ON "tax_rates"
  USING (org_id::text = current_setting('app.org_id', true));

CREATE POLICY tenant_isolation ON "sales_invoices"
  USING (org_id::text = current_setting('app.org_id', true));

CREATE POLICY tenant_isolation ON "purchase_bills"
  USING (org_id::text = current_setting('app.org_id', true));

CREATE POLICY tenant_isolation ON "payments"
  USING (org_id::text = current_setting('app.org_id', true));

CREATE POLICY tenant_isolation ON "attachments"
  USING (org_id::text = current_setting('app.org_id', true));

CREATE POLICY tenant_isolation ON "number_sequences"
  USING (org_id::text = current_setting('app.org_id', true));

CREATE POLICY tenant_isolation ON "audit_logs"
  USING (org_id::text = current_setting('app.org_id', true));


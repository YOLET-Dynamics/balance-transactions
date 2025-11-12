export type BillStatus = "Draft" | "Pending" | "Paid" | "Overdue" | "Cancelled";

export interface PurchaseBillLine {
  id?: string;
  itemId?: string | null;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  discountAmount?: number;
  lineTotal: number;
  isVatApplicable: boolean;
}

export interface CreatePurchaseBillData {
  number: string;
  year: number;
  seqValue: number;

  vendorLegalName?: string | null;
  vendorTradeName?: string | null;
  vendorSubcity?: string | null;
  vendorCityRegion?: string | null;
  vendorCountry?: string;
  vendorTin?: string | null;
  vendorVatNumber?: string | null;
  vendorPhone?: string | null;

  currency?: string;
  subtotal: number;
  vatAmount: number;
  total: number;

  withheldPct?: number | null;
  withheldAmount?: number | null;
  netPaid: number;

  reason: string;
  paymentMethod: string;
  paymentRef?: string | null;

  status?: string;

  createdBy?: string | null;
  reviewedBy?: string | null;
  authorizedBy?: string | null;

  lines: Array<{
    itemId?: string | null;
    description: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    discountAmount?: number;
    lineTotal: number;
    isVatApplicable: boolean;
  }>;
}

export interface PurchaseBill {
  id: string;
  orgId: string;
  number: string;
  year: number;
  seqValue: number;

  vendorLegalName: string | null;
  vendorTradeName: string | null;
  vendorSubcity: string | null;
  vendorCityRegion: string | null;
  vendorCountry: string | null;
  vendorTin: string | null;
  vendorVatNumber: string | null;
  vendorPhone: string | null;

  currency: string;
  subtotal: number;
  vatAmount: number;
  total: number;

  withheldPct: number | null;
  withheldAmount: number | null;
  netPaid: number;

  reason: string;
  paymentMethod: string;
  paymentRef: string | null;

  status: string;

  createdBy: string | null;
  reviewedBy: string | null;
  authorizedBy: string | null;

  pdfAttachmentId: string | null;

  lines?: PurchaseBillLine[];

  createdAt: string | null;
  updatedAt: string | null;
}

export interface ListOptions {
  page?: number;
  limit?: number;
  search?: string;
  year?: number;
  fromDate?: Date;
  toDate?: Date;
}

export interface IPurchasesRepository {
  create(orgId: string, data: CreatePurchaseBillData): Promise<PurchaseBill>;
  findById(orgId: string, id: string): Promise<PurchaseBill | null>;
  findByNumber(orgId: string, number: string): Promise<PurchaseBill | null>;
  list(
    orgId: string,
    options: ListOptions
  ): Promise<{ bills: PurchaseBill[]; total: number }>;
  update(
    orgId: string,
    id: string,
    data: Partial<CreatePurchaseBillData>
  ): Promise<PurchaseBill>;
  delete(orgId: string, id: string): Promise<void>;
  attachPdf(orgId: string, id: string, attachmentId: string): Promise<void>;
  getRecentBills(orgId: string, limit: number): Promise<PurchaseBill[]>;
}

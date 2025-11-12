type PartyType = "Company" | "Individual";
type GoodsOrService = "Goods" | "Service";
type PaymentMethod = "Cash" | "Cheque" | "BankTransfer" | "POS" | "Mobile";
type InvoiceStatus = "Draft" | "Pending" | "Paid" | "Overdue" | "Cancelled";

export interface SalesInvoiceLine {
  itemId?: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  isVatApplicable: boolean;
}

export interface CreateSalesInvoiceData {
  number: string;
  year: number;
  seqValue: number;

  buyerType?: PartyType;
  buyerLegalName?: string;
  buyerTradeName?: string;
  buyerSubcity?: string;
  buyerCityRegion?: string;
  buyerCountry?: string;
  buyerTin?: string;
  buyerVatNumber?: string;
  buyerPhone?: string;

  subtotal: number;
  vatAmount: number;
  total: number;
  totalInWords: string;

  goodsOrService: GoodsOrService;
  withheldPct?: number;
  withheldAmount?: number;
  netPayable: number;

  paymentMethod: PaymentMethod;
  paymentRef?: string;

  status?: InvoiceStatus;

  createdBy?: string;
  reviewedBy?: string;
  authorizedBy?: string;
  receivedBy?: string;

  notes?: string;

  lines: SalesInvoiceLine[];
}

export interface SalesInvoice {
  id: string;
  orgId: string;
  number: string;
  year: number;
  seqValue: number;

  buyerType?: PartyType | null;
  buyerLegalName?: string | null;
  buyerTradeName?: string | null;
  buyerSubcity?: string | null;
  buyerCityRegion?: string | null;
  buyerCountry?: string | null;
  buyerTin?: string | null;
  buyerVatNumber?: string | null;
  buyerPhone?: string | null;

  currency: string;
  subtotal: any;
  vatAmount: any;
  total: any;
  totalInWords: string;

  goodsOrService: GoodsOrService;
  withheldPct?: any;
  withheldAmount?: any;
  netPayable: any;

  paymentMethod: PaymentMethod;
  paymentRef?: string | null;

  status: InvoiceStatus;

  createdBy?: string | null;
  reviewedBy?: string | null;
  authorizedBy?: string | null;
  receivedBy?: string | null;

  notes?: string | null;
  pdfAttachmentId?: string | null;

  createdAt: string | null;
  updatedAt: string | null;
}

export interface DashboardStats {
  totalRevenue: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  draftInvoices: number;
  revenueGrowth: number;
  totalExpenses: number;
  totalBills: number;
  expensesGrowth: number;
}

export interface ISalesRepository {
  create(orgId: string, data: CreateSalesInvoiceData): Promise<SalesInvoice>;
  findById(orgId: string, id: string): Promise<SalesInvoice | null>;
  findByNumber(orgId: string, number: string): Promise<SalesInvoice | null>;
  list(
    orgId: string,
    options: ListOptions
  ): Promise<{ invoices: SalesInvoice[]; total: number }>;
  update(
    orgId: string,
    id: string,
    data: Partial<CreateSalesInvoiceData>
  ): Promise<SalesInvoice>;
  delete(orgId: string, id: string): Promise<void>;
  attachPdf(orgId: string, id: string, attachmentId: string): Promise<void>;
  getStats(orgId: string, year: number, month: number): Promise<DashboardStats>;
  getRecentInvoices(orgId: string, limit: number): Promise<SalesInvoice[]>;
}

export interface ListOptions {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  year?: number;
  fromDate?: Date;
  toDate?: Date;
}

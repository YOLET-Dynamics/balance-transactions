export type PaymentDirection = "Incoming" | "Outgoing";
export type RelatedType = "Invoice" | "Bill" | "None";

export interface CreatePaymentData {
  direction: PaymentDirection;
  method: string;
  amount: number;
  currency?: string;
  relatedType: RelatedType;
  relatedId?: string | null;
  advanceReceiptNumber?: string | null;
  fiscalReceiptNumber?: string | null;
  createdBy?: string | null;
  reviewedBy?: string | null;
  authorizedBy?: string | null;
}

export interface Payment {
  id: string;
  orgId: string;
  direction: PaymentDirection;
  method: string;
  amount: number;
  currency: string;
  relatedType: RelatedType;
  relatedId: string | null;
  advanceReceiptNumber: string | null;
  voucherPdfId: string | null;
  createdBy: string | null;
  reviewedBy: string | null;
  authorizedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListOptions {
  page?: number;
  limit?: number;
  search?: string;
  direction?: PaymentDirection;
  relatedType?: RelatedType;
  relatedId?: string;
  year?: number;
}

export interface IPaymentsRepository {
  create(orgId: string, data: CreatePaymentData): Promise<Payment>;
  findById(orgId: string, id: string): Promise<Payment | null>;
  list(
    orgId: string,
    options: ListOptions
  ): Promise<{ payments: Payment[]; total: number }>;
  update(
    orgId: string,
    id: string,
    data: Partial<CreatePaymentData>
  ): Promise<Payment>;
  delete(orgId: string, id: string): Promise<void>;
  getRecentPayments(orgId: string, limit: number): Promise<Payment[]>;
  sumForRelated(
    orgId: string,
    relatedType: RelatedType,
    relatedId: string
  ): Promise<number>;
}

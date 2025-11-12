import type {
  ISalesRepository,
  CreateSalesInvoiceData,
  SalesInvoice,
  ListOptions,
} from "../../domain/repositories/sales.repository";
import { sequenceService } from "./sequence.service";
import {
  moneyToWords,
  calculateVAT,
  calculateWithholding,
  roundMoney,
  addMoney,
  subtractMoney,
} from "../../lib/utils/money";
import { NotFoundError } from "../../lib/utils/errors";

type GoodsOrService = "Goods" | "Service";
type PartyType = "Company" | "Individual";
type InvoiceStatus = "Draft" | "Pending" | "Paid" | "Overdue" | "Cancelled";

interface CreateInvoiceInput {
  buyerType?: PartyType;
  buyerLegalName?: string;
  buyerTradeName?: string;
  buyerSubcity?: string;
  buyerCityRegion?: string;
  buyerCountry?: string;
  buyerTin?: string;
  buyerVatNumber?: string;
  buyerPhone?: string;

  goodsOrService: GoodsOrService;
  paymentMethod: string;
  paymentRef?: string;

  status?: InvoiceStatus;

  lines: Array<{
    itemId?: string;
    description: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    isVatApplicable: boolean;
  }>;

  createdBy?: string;
  reviewedBy?: string;
  authorizedBy?: string;
  receivedBy?: string;

  notes?: string;
}

export class SalesService {
  constructor(private salesRepo: ISalesRepository) {}

  async createInvoice(
    orgId: string,
    orgCode: string,
    input: CreateInvoiceInput
  ): Promise<SalesInvoice> {
    const docNumber = await sequenceService.allocateNext(orgId, orgCode, "CS");

    const lines = input.lines.map((line) => ({
      ...line,
      lineTotal: roundMoney(line.quantity * line.unitPrice),
    }));

    const subtotal = lines.reduce(
      (sum, line) => addMoney(sum, line.lineTotal),
      0
    );

    const vatableAmount = lines
      .filter((line) => line.isVatApplicable)
      .reduce((sum, line) => addMoney(sum, line.lineTotal), 0);
    const vatAmount = calculateVAT(vatableAmount);

    const total = addMoney(subtotal, vatAmount);

    const isCompany = input.buyerType === "Company";
    const isService = input.goodsOrService === "Service";
    const { withheldPct, withheldAmount } = calculateWithholding(
      subtotal,
      isCompany,
      isService
    );

    const netPayable = subtractMoney(total, withheldAmount);

    const totalInWords = moneyToWords(total);

    const invoiceData: CreateSalesInvoiceData = {
      number: docNumber.full,
      year: docNumber.year,
      seqValue: docNumber.seqValue,

      buyerType: input.buyerType,
      buyerLegalName: input.buyerLegalName,
      buyerTradeName: input.buyerTradeName,
      buyerSubcity: input.buyerSubcity,
      buyerCityRegion: input.buyerCityRegion,
      buyerCountry: input.buyerCountry || "ET",
      buyerTin: input.buyerTin,
      buyerVatNumber: input.buyerVatNumber,
      buyerPhone: input.buyerPhone,

      subtotal,
      vatAmount,
      total,
      totalInWords,

      goodsOrService: input.goodsOrService,
      withheldPct: withheldPct > 0 ? withheldPct : undefined,
      withheldAmount: withheldAmount > 0 ? withheldAmount : undefined,
      netPayable,

      paymentMethod: input.paymentMethod as any,
      paymentRef: input.paymentRef,

      status: input.status,

      createdBy: input.createdBy,
      reviewedBy: input.reviewedBy,
      authorizedBy: input.authorizedBy,
      receivedBy: input.receivedBy,

      notes: input.notes,

      lines: input.lines,
    };

    return await this.salesRepo.create(orgId, invoiceData);
  }

  async getInvoiceById(orgId: string, id: string): Promise<SalesInvoice> {
    const invoice = await this.salesRepo.findById(orgId, id);
    if (!invoice) {
      throw new NotFoundError("Invoice not found");
    }
    return invoice;
  }

  async listInvoices(orgId: string, options: ListOptions) {
    return await this.salesRepo.list(orgId, options);
  }

  async updateInvoice(
    orgId: string,
    id: string,
    data: Partial<CreateInvoiceInput>
  ): Promise<SalesInvoice> {
    await this.getInvoiceById(orgId, id);

    return await this.salesRepo.update(orgId, id, data as any);
  }

  async deleteInvoice(orgId: string, id: string): Promise<void> {
    await this.salesRepo.delete(orgId, id);
  }

  async attachPdf(
    orgId: string,
    id: string,
    attachmentId: string
  ): Promise<void> {
    await this.salesRepo.attachPdf(orgId, id, attachmentId);
  }

  async getStats(orgId: string, year: number, month: number) {
    return await this.salesRepo.getStats(orgId, year, month);
  }

  async getRecentInvoices(orgId: string, limit: number = 5) {
    return await this.salesRepo.getRecentInvoices(orgId, limit);
  }
}

import { salesRepository } from "../../infrastructure/repositories/sales.repository.impl";
export const salesService = new SalesService(salesRepository);

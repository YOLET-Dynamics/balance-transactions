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
import { NotFoundError, ValidationError } from "../../lib/utils/errors";

type GoodsOrService = "Goods" | "Service";
type PartyType = "Company" | "Individual";
type InvoiceStatus = "Draft" | "Pending" | "Paid" | "Overdue" | "Cancelled";
type InvoiceType = "Cash" | "Credit";
type ItemType = "Good" | "Service";

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

  invoiceType: InvoiceType;
  invoiceDate: Date;
  dueDate: Date;
  paidDate?: Date;
  fiscalReceiptNumber?: string;

  status?: InvoiceStatus;
  
  applyWithholding?: boolean;

  lines: Array<{
    itemId?: string;
    lineType?: ItemType;
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

  private calculateInvoiceData(input: CreateInvoiceInput) {
    const defaultLineType: ItemType =
      input.goodsOrService === "Service" ? "Service" : "Good";
    const lines = input.lines.map((line) => ({
      ...line,
      lineType: line.lineType || defaultLineType,
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

    const { withheldPct, withheldAmount } = calculateWithholding(
      lines,
      !!input.applyWithholding
    );

    const netPayable = subtractMoney(total, withheldAmount);
    const totalInWords = moneyToWords(total);

    return {
      lines,
      subtotal,
      vatAmount,
      total,
      totalInWords,
      withheldPct,
      withheldAmount,
      netPayable,
    };
  }

  private resolveInvoiceState(input: {
    invoiceType: InvoiceType;
    invoiceDate: Date;
    dueDate: Date;
    paidDate?: Date;
    fiscalReceiptNumber?: string | null;
    status?: InvoiceStatus;
  }): { invoiceType: InvoiceType; status: InvoiceStatus; paidDate?: Date } {
    const fiscalReceiptNumber = input.fiscalReceiptNumber?.trim();

    if (input.invoiceType === "Cash" || input.status === "Paid" || input.paidDate) {
      if (!fiscalReceiptNumber) {
        throw new ValidationError("FS number is required for paid sales", {
          fiscalReceiptNumber: ["FS number is required for paid sales"],
        });
      }

      return {
        invoiceType: "Cash",
        status: "Paid",
        paidDate: input.paidDate || input.invoiceDate,
      };
    }

    if (input.status) {
      return {
        invoiceType: input.invoiceType,
        status: input.status,
        paidDate: undefined,
      };
    }

    const now = new Date();
    const dueDate = new Date(input.dueDate);

    return {
      invoiceType: input.invoiceType,
      status: now > dueDate ? "Overdue" : "Pending",
      paidDate: undefined,
    };
  }

  async createInvoice(
    orgId: string,
    orgCode: string,
    input: CreateInvoiceInput
  ): Promise<SalesInvoice> {
    const docNumber = await sequenceService.allocateNext(orgId, orgCode, "CS");
    const totals = this.calculateInvoiceData(input);
    const state = this.resolveInvoiceState(input);

    const invoiceData: CreateSalesInvoiceData = {
      number: docNumber.full,
      year: docNumber.year,
      seqValue: docNumber.seqValue,
      kind: "Invoice",

      buyerType: input.buyerType,
      buyerLegalName: input.buyerLegalName,
      buyerTradeName: input.buyerTradeName,
      buyerSubcity: input.buyerSubcity,
      buyerCityRegion: input.buyerCityRegion,
      buyerCountry: input.buyerCountry || "ET",
      buyerTin: input.buyerTin,
      buyerVatNumber: input.buyerVatNumber,
      buyerPhone: input.buyerPhone,

      subtotal: totals.subtotal,
      vatAmount: totals.vatAmount,
      total: totals.total,
      totalInWords: totals.totalInWords,

      goodsOrService: input.goodsOrService,
      withheldPct: totals.withheldPct > 0 ? totals.withheldPct : undefined,
      withheldAmount:
        totals.withheldAmount > 0 ? totals.withheldAmount : undefined,
      netPayable: totals.netPayable,

      paymentMethod: input.paymentMethod as any,
      paymentRef: input.paymentRef,

      invoiceType: state.invoiceType,
      invoiceDate: input.invoiceDate,
      dueDate: input.dueDate,
      paidDate: state.paidDate,
      fiscalReceiptNumber: input.fiscalReceiptNumber?.trim(),

      status: state.status,

      createdBy: input.createdBy,
      reviewedBy: input.reviewedBy,
      authorizedBy: input.authorizedBy,
      receivedBy: input.receivedBy,

      notes: input.notes,

      lines: totals.lines,
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
    const existing = await this.getInvoiceById(orgId, id);
    const nextData: any = { ...data };

    if (data.lines) {
      const mergedInput: CreateInvoiceInput = {
        buyerType: data.buyerType ?? existing.buyerType ?? undefined,
        buyerLegalName: data.buyerLegalName ?? existing.buyerLegalName ?? undefined,
        buyerTradeName: data.buyerTradeName ?? existing.buyerTradeName ?? undefined,
        buyerSubcity: data.buyerSubcity ?? existing.buyerSubcity ?? undefined,
        buyerCityRegion:
          data.buyerCityRegion ?? existing.buyerCityRegion ?? undefined,
        buyerCountry: data.buyerCountry ?? existing.buyerCountry ?? undefined,
        buyerTin: data.buyerTin ?? existing.buyerTin ?? undefined,
        buyerVatNumber:
          data.buyerVatNumber ?? existing.buyerVatNumber ?? undefined,
        buyerPhone: data.buyerPhone ?? existing.buyerPhone ?? undefined,
        goodsOrService:
          data.goodsOrService ?? (existing.goodsOrService as GoodsOrService),
        paymentMethod: data.paymentMethod ?? existing.paymentMethod,
        paymentRef: data.paymentRef ?? existing.paymentRef ?? undefined,
        invoiceType: data.invoiceType ?? existing.invoiceType,
        invoiceDate: data.invoiceDate ?? new Date(existing.invoiceDate),
        dueDate: data.dueDate ?? new Date(existing.dueDate),
        paidDate:
          data.paidDate ?? (existing.paidDate ? new Date(existing.paidDate) : undefined),
        fiscalReceiptNumber:
          data.fiscalReceiptNumber ?? existing.fiscalReceiptNumber ?? undefined,
        status: data.status ?? existing.status,
        applyWithholding:
          data.applyWithholding ??
          (Number(existing.withheldAmount || 0) > 0),
        lines: data.lines,
        createdBy: data.createdBy ?? existing.createdBy ?? undefined,
        reviewedBy: data.reviewedBy ?? existing.reviewedBy ?? undefined,
        authorizedBy: data.authorizedBy ?? existing.authorizedBy ?? undefined,
        receivedBy: data.receivedBy ?? existing.receivedBy ?? undefined,
        notes: data.notes ?? existing.notes ?? undefined,
      };
      const totals = this.calculateInvoiceData(mergedInput);
      Object.assign(nextData, {
        subtotal: totals.subtotal,
        vatAmount: totals.vatAmount,
        total: totals.total,
        totalInWords: totals.totalInWords,
        withheldPct: totals.withheldPct > 0 ? totals.withheldPct : null,
        withheldAmount:
          totals.withheldAmount > 0 ? totals.withheldAmount : null,
        netPayable: totals.netPayable,
        lines: totals.lines,
      });
    }

    const state = this.resolveInvoiceState({
      invoiceType: nextData.invoiceType ?? existing.invoiceType,
      invoiceDate: nextData.invoiceDate ?? new Date(existing.invoiceDate),
      dueDate: nextData.dueDate ?? new Date(existing.dueDate),
      paidDate:
        nextData.paidDate ??
        (existing.paidDate ? new Date(existing.paidDate) : undefined),
      fiscalReceiptNumber:
        nextData.fiscalReceiptNumber ?? existing.fiscalReceiptNumber,
      status: nextData.status ?? existing.status,
    });

    nextData.invoiceType = state.invoiceType;
    nextData.status = state.status;
    nextData.paidDate = state.paidDate;
    if (nextData.fiscalReceiptNumber) {
      nextData.fiscalReceiptNumber = nextData.fiscalReceiptNumber.trim();
    }

    return await this.salesRepo.update(orgId, id, nextData);
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

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
type ProformaStatus = "Draft" | "Pending" | "Cancelled";
type InvoiceType = "Cash" | "Credit";

interface CreateProformaInput {
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

  status?: ProformaStatus;
  
  applyWithholding?: boolean;

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

export class ProformaService {
  constructor(private salesRepo: ISalesRepository) {}

  async createProforma(
    orgId: string,
    orgCode: string,
    input: CreateProformaInput
  ): Promise<SalesInvoice> {
    const docNumber = await sequenceService.allocateNext(orgId, orgCode, "PI");

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
    const shouldApplyWithholding = input.applyWithholding && isCompany && isService;
    const { withheldPct, withheldAmount } = shouldApplyWithholding
      ? calculateWithholding(subtotal, isCompany, isService)
      : { withheldPct: 0, withheldAmount: 0 };

    const netPayable = subtractMoney(total, withheldAmount);

    const totalInWords = moneyToWords(total);

    const status: ProformaStatus = input.status || "Draft";

    const proformaData: CreateSalesInvoiceData = {
      number: docNumber.full,
      year: docNumber.year,
      seqValue: docNumber.seqValue,
      kind: "Proforma",

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

      invoiceType: input.invoiceType,
      invoiceDate: input.invoiceDate,
      dueDate: input.dueDate,

      status: status as any,

      createdBy: input.createdBy,
      reviewedBy: input.reviewedBy,
      authorizedBy: input.authorizedBy,
      receivedBy: input.receivedBy,

      notes: input.notes,

      lines: lines,
    };

    return await this.salesRepo.create(orgId, proformaData);
  }

  async getProformaById(orgId: string, id: string): Promise<SalesInvoice> {
    const proforma = await this.salesRepo.findById(orgId, id);
    if (!proforma || proforma.kind !== "Proforma") {
      throw new NotFoundError("Proforma invoice not found");
    }
    return proforma;
  }

  async listProformas(orgId: string, options: ListOptions) {
    return await this.salesRepo.list(orgId, { ...options, kind: "Proforma" });
  }

  async updateProforma(
    orgId: string,
    id: string,
    data: Partial<CreateProformaInput>
  ): Promise<SalesInvoice> {
    const proforma = await this.getProformaById(orgId, id);

    if (data.status && !["Draft", "Pending", "Cancelled"].includes(data.status)) {
      throw new Error("Invalid status for proforma invoice");
    }

    return await this.salesRepo.update(orgId, id, data as any);
  }

  async deleteProforma(orgId: string, id: string): Promise<void> {
    await this.getProformaById(orgId, id);
    await this.salesRepo.delete(orgId, id);
  }
}

import { salesRepository } from "../../infrastructure/repositories/sales.repository.impl";
export const proformaService = new ProformaService(salesRepository);


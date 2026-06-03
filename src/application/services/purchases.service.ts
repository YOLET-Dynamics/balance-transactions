import { purchasesRepository } from "@/infrastructure/repositories/purchases.repository.impl";
import { sequenceService } from "./sequence.service";
import type {
  PurchaseBill,
  ListOptions,
} from "@/domain/repositories/purchases.repository";
import { NotFoundError, ValidationError } from "@/lib/utils/errors";
import {
  addMoney,
  calculateVAT,
  calculateWithholding,
  roundMoney,
  subtractMoney,
} from "@/lib/utils/money";

type ItemType = "Good" | "Service";

interface CreateBillInput {
  vendorLegalName?: string;
  vendorTradeName?: string;
  vendorSubcity?: string;
  vendorCityRegion?: string;
  vendorCountry?: string;
  vendorTin?: string;
  vendorVatNumber?: string;
  vendorPhone?: string;

  reason: string;
  paymentMethod: string;
  paymentRef?: string;

  status?: string;
  applyWithholding?: boolean;
  withholdingOverrideReason?: string;

  createdBy?: string;
  reviewedBy?: string;
  authorizedBy?: string;

  lines: Array<{
    itemId?: string;
    lineType?: ItemType;
    description: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    discountAmount?: number;
    isVatApplicable: boolean;
  }>;
}

class PurchasesService {
  private purchasesRepo = purchasesRepository;

  private resolveApplyWithholding(
    isWithholdingAgent: boolean,
    input: Partial<CreateBillInput>
  ): boolean {
    return input.applyWithholding ?? isWithholdingAgent;
  }

  private calculateBillData(
    input: CreateBillInput,
    isWithholdingAgent: boolean
  ) {
    const applyWithholding = this.resolveApplyWithholding(
      isWithholdingAgent,
      input
    );

    if (
      isWithholdingAgent &&
      !applyWithholding &&
      !input.withholdingOverrideReason?.trim()
    ) {
      throw new ValidationError(
        "Reason is required when withholding is disabled",
        {
          withholdingOverrideReason: [
            "Reason is required when withholding is disabled",
          ],
        }
      );
    }

    const lines = input.lines.map((line) => {
      const baseAmount = roundMoney(line.quantity * line.unitPrice);
      const lineTotal = subtractMoney(baseAmount, line.discountAmount || 0);

      return {
        ...line,
        lineType: line.lineType || "Good",
        discountAmount: line.discountAmount || 0,
        lineTotal,
      };
    });

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
      applyWithholding
    );
    const netPaid = subtractMoney(total, withheldAmount);

    return {
      lines,
      subtotal,
      vatAmount,
      total,
      withheldPct,
      withheldAmount,
      netPaid,
      withholdingOverrideReason:
        isWithholdingAgent && !applyWithholding
          ? input.withholdingOverrideReason?.trim()
          : undefined,
    };
  }

  async createBill(
    orgId: string,
    orgCode: string,
    input: CreateBillInput,
    isWithholdingAgent: boolean = false
  ): Promise<PurchaseBill> {
    // Generate document number using sequence service
    const docNumber = await sequenceService.allocateNext(orgId, orgCode, "PB");

    const { full: number, year: docYear, seqValue } = docNumber;
    const totals = this.calculateBillData(input, isWithholdingAgent);

    const billData = {
      number,
      year: docYear,
      seqValue,

      vendorLegalName: input.vendorLegalName,
      vendorTradeName: input.vendorTradeName,
      vendorSubcity: input.vendorSubcity,
      vendorCityRegion: input.vendorCityRegion,
      vendorCountry: input.vendorCountry || "ET",
      vendorTin: input.vendorTin,
      vendorVatNumber: input.vendorVatNumber,
      vendorPhone: input.vendorPhone,

      subtotal: totals.subtotal,
      vatAmount: totals.vatAmount,
      total: totals.total,

      withheldPct: totals.withheldPct > 0 ? totals.withheldPct : undefined,
      withheldAmount:
        totals.withheldAmount > 0 ? totals.withheldAmount : undefined,
      withholdingOverrideReason: totals.withholdingOverrideReason,
      netPaid: totals.netPaid,

      reason: input.reason,
      paymentMethod: input.paymentMethod as any,
      paymentRef: input.paymentRef,

      status: input.status || "Pending",

      createdBy: input.createdBy,
      reviewedBy: input.reviewedBy,
      authorizedBy: input.authorizedBy,

      lines: totals.lines,
    };

    return await this.purchasesRepo.create(orgId, billData);
  }

  async getBillById(orgId: string, id: string): Promise<PurchaseBill> {
    const bill = await this.purchasesRepo.findById(orgId, id);
    if (!bill) {
      throw new NotFoundError("Purchase bill not found");
    }
    return bill;
  }

  async listBills(orgId: string, options: ListOptions) {
    return await this.purchasesRepo.list(orgId, options);
  }

  async updateBill(
    orgId: string,
    id: string,
    data: Partial<CreateBillInput>,
    isWithholdingAgent: boolean = false
  ): Promise<PurchaseBill> {
    const existing = await this.getBillById(orgId, id);
    const nextData: any = { ...data };

    if (data.lines || data.applyWithholding !== undefined) {
      const mergedInput: CreateBillInput = {
        vendorLegalName:
          data.vendorLegalName ?? existing.vendorLegalName ?? undefined,
        vendorTradeName:
          data.vendorTradeName ?? existing.vendorTradeName ?? undefined,
        vendorSubcity: data.vendorSubcity ?? existing.vendorSubcity ?? undefined,
        vendorCityRegion:
          data.vendorCityRegion ?? existing.vendorCityRegion ?? undefined,
        vendorCountry: data.vendorCountry ?? existing.vendorCountry ?? undefined,
        vendorTin: data.vendorTin ?? existing.vendorTin ?? undefined,
        vendorVatNumber:
          data.vendorVatNumber ?? existing.vendorVatNumber ?? undefined,
        vendorPhone: data.vendorPhone ?? existing.vendorPhone ?? undefined,
        reason: data.reason ?? existing.reason,
        paymentMethod: data.paymentMethod ?? existing.paymentMethod,
        paymentRef: data.paymentRef ?? existing.paymentRef ?? undefined,
        status: data.status ?? existing.status,
        applyWithholding:
          data.applyWithholding ?? Number(existing.withheldAmount || 0) > 0,
        withholdingOverrideReason:
          data.withholdingOverrideReason ??
          existing.withholdingOverrideReason ??
          undefined,
        createdBy: data.createdBy ?? existing.createdBy ?? undefined,
        reviewedBy: data.reviewedBy ?? existing.reviewedBy ?? undefined,
        authorizedBy: data.authorizedBy ?? existing.authorizedBy ?? undefined,
        lines:
          data.lines ??
          existing.lines?.map((line) => ({
            itemId: line.itemId || undefined,
            lineType: line.lineType,
            description: line.description,
            unit: line.unit,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            discountAmount: line.discountAmount,
            isVatApplicable: line.isVatApplicable,
          })) ??
          [],
      };
      const totals = this.calculateBillData(mergedInput, isWithholdingAgent);
      Object.assign(nextData, {
        subtotal: totals.subtotal,
        vatAmount: totals.vatAmount,
        total: totals.total,
        withheldPct: totals.withheldPct > 0 ? totals.withheldPct : null,
        withheldAmount:
          totals.withheldAmount > 0 ? totals.withheldAmount : null,
        withholdingOverrideReason: totals.withholdingOverrideReason,
        netPaid: totals.netPaid,
        lines: totals.lines,
      });
    }

    return await this.purchasesRepo.update(orgId, id, nextData);
  }

  async deleteBill(orgId: string, id: string): Promise<void> {
    await this.purchasesRepo.delete(orgId, id);
  }

  async attachPdf(
    orgId: string,
    id: string,
    attachmentId: string
  ): Promise<void> {
    await this.purchasesRepo.attachPdf(orgId, id, attachmentId);
  }

  async getRecentBills(orgId: string, limit: number = 5) {
    return await this.purchasesRepo.getRecentBills(orgId, limit);
  }
}

export const purchasesService = new PurchasesService();

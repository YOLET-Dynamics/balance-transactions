import { purchasesRepository } from "@/infrastructure/repositories/purchases.repository.impl";
import { sequenceService } from "./sequence.service";
import type {
  PurchaseBill,
  ListOptions,
} from "@/domain/repositories/purchases.repository";
import { NotFoundError } from "@/lib/utils/errors";

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
  withholdingPct?: number;

  createdBy?: string;
  reviewedBy?: string;
  authorizedBy?: string;

  lines: Array<{
    itemId?: string;
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

  async createBill(
    orgId: string,
    orgCode: string,
    input: CreateBillInput
  ): Promise<PurchaseBill> {
    const now = new Date();
    const year = now.getFullYear();

    // Generate document number using sequence service
    const docNumber = await sequenceService.allocateNext(orgId, orgCode, "PB");

    const { full: number, year: docYear, seqValue } = docNumber;

    // Calculate totals
    const lineTotals = input.lines.map((line) => {
      const baseAmount = line.quantity * line.unitPrice;
      const discount = line.discountAmount || 0;
      return baseAmount - discount;
    });

    const subtotal = lineTotals.reduce((sum, total) => sum + total, 0);

    // Calculate VAT (15%)
    const vatableAmount = input.lines.reduce((sum, line, index) => {
      if (line.isVatApplicable) {
        return sum + lineTotals[index];
      }
      return sum;
    }, 0);
    const vatAmount = vatableAmount * 0.15;

    const total = subtotal + vatAmount;

    const withheldPct = input.withholdingPct || 0;
    const withheldAmount = withheldPct > 0 ? (subtotal * withheldPct) / 100 : 0;
    const netPaid = total - withheldAmount;

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

      subtotal,
      vatAmount,
      total,

      withheldPct: withheldPct > 0 ? withheldPct : undefined,
      withheldAmount: withheldAmount > 0 ? withheldAmount : undefined,
      netPaid,

      reason: input.reason,
      paymentMethod: input.paymentMethod as any,
      paymentRef: input.paymentRef,

      status: input.status || "Pending",

      createdBy: input.createdBy,
      reviewedBy: input.reviewedBy,
      authorizedBy: input.authorizedBy,

      lines: input.lines.map((line, index) => ({
        ...line,
        lineTotal: lineTotals[index],
      })),
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
    data: Partial<CreateBillInput>
  ): Promise<PurchaseBill> {
    await this.getBillById(orgId, id);

    return await this.purchasesRepo.update(orgId, id, data as any);
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

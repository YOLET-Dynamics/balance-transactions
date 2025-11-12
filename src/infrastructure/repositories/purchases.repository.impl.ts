import { prisma } from "@/infrastructure/database/prisma";
import {
  IPurchasesRepository,
  CreatePurchaseBillData,
  PurchaseBill,
  ListOptions,
} from "@/domain/repositories/purchases.repository";

async function withTenantContext<T>(
  orgId: string,
  callback: (tx: typeof prisma) => Promise<T>
): Promise<T> {
  return callback(prisma);
}

function serializeBill(bill: any): any {
  if (!bill) return null;

  return {
    ...bill,
    subtotal: bill.subtotal ? Number(bill.subtotal) : 0,
    vatAmount: bill.vatAmount ? Number(bill.vatAmount) : 0,
    total: bill.total ? Number(bill.total) : 0,
    withheldPct: bill.withheldPct ? Number(bill.withheldPct) : null,
    withheldAmount: bill.withheldAmount ? Number(bill.withheldAmount) : null,
    netPaid: bill.netPaid ? Number(bill.netPaid) : 0,
    createdAt: bill.createdAt ? bill.createdAt.toISOString() : null,
    updatedAt: bill.updatedAt ? bill.updatedAt.toISOString() : null,
    lines:
      bill.lines?.map((line: any) => ({
        ...line,
        quantity: line.quantity ? Number(line.quantity) : 0,
        unitPrice: line.unitPrice ? Number(line.unitPrice) : 0,
        discountAmount: line.discountAmount ? Number(line.discountAmount) : 0,
        lineTotal: line.lineTotal ? Number(line.lineTotal) : 0,
      })) || [],
  };
}

class PurchasesRepositoryImpl implements IPurchasesRepository {
  async create(
    orgId: string,
    data: CreatePurchaseBillData
  ): Promise<PurchaseBill> {
    return await withTenantContext(orgId, async (tx) => {
      const bill = await tx.purchaseBill.create({
        data: {
          orgId,
          number: data.number,
          year: data.year,
          seqValue: data.seqValue,

          vendorLegalName: data.vendorLegalName,
          vendorTradeName: data.vendorTradeName,
          vendorSubcity: data.vendorSubcity,
          vendorCityRegion: data.vendorCityRegion,
          vendorCountry: data.vendorCountry || "ET",
          vendorTin: data.vendorTin,
          vendorVatNumber: data.vendorVatNumber,
          vendorPhone: data.vendorPhone,

          currency: data.currency || "ETB",
          subtotal: data.subtotal,
          vatAmount: data.vatAmount,
          total: data.total,

          withheldPct: data.withheldPct,
          withheldAmount: data.withheldAmount,
          netPaid: data.netPaid,

          reason: data.reason,
          paymentMethod: data.paymentMethod as any,
          paymentRef: data.paymentRef,

          status: data.status as any,

          createdBy: data.createdBy,
          reviewedBy: data.reviewedBy,
          authorizedBy: data.authorizedBy,

          lines: {
            create: data.lines.map((line, index) => ({
              seq: index + 1,
              itemId: line.itemId,
              description: line.description,
              unit: line.unit,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              discountAmount: line.discountAmount || 0,
              lineTotal: line.lineTotal,
              isVatApplicable: line.isVatApplicable,
            })),
          },
        },
        include: {
          lines: true,
        },
      });

      return serializeBill(bill);
    });
  }

  async findById(orgId: string, id: string): Promise<PurchaseBill | null> {
    return await withTenantContext(orgId, async (tx) => {
      const bill = await tx.purchaseBill.findUnique({
        where: { id },
        include: {
          lines: true,
        },
      });
      return serializeBill(bill);
    });
  }

  async findByNumber(
    orgId: string,
    number: string
  ): Promise<PurchaseBill | null> {
    return await withTenantContext(orgId, async (tx) => {
      const bill = await tx.purchaseBill.findUnique({
        where: { orgId_number: { orgId, number } },
        include: {
          lines: true,
        },
      });
      return serializeBill(bill);
    });
  }

  async list(
    orgId: string,
    options: ListOptions
  ): Promise<{ bills: PurchaseBill[]; total: number }> {
    return await withTenantContext(orgId, async (tx) => {
      const where: any = { orgId };

      if (options.search) {
        where.OR = [
          { number: { contains: options.search, mode: "insensitive" } },
          {
            vendorLegalName: { contains: options.search, mode: "insensitive" },
          },
          {
            vendorTradeName: { contains: options.search, mode: "insensitive" },
          },
          { vendorTin: { contains: options.search, mode: "insensitive" } },
        ];
      }

      if (options.year) {
        where.year = options.year;
      }

      if (options.fromDate || options.toDate) {
        where.createdAt = {};
        if (options.fromDate) where.createdAt.gte = options.fromDate;
        if (options.toDate) where.createdAt.lte = options.toDate;
      }

      const [bills, total] = await Promise.all([
        tx.purchaseBill.findMany({
          where,
          include: {
            lines: true,
          },
          orderBy: { createdAt: "desc" },
          skip:
            options.page && options.limit
              ? (options.page - 1) * options.limit
              : undefined,
          take: options.limit,
        }),
        tx.purchaseBill.count({ where }),
      ]);

      return {
        bills: bills.map(serializeBill),
        total,
      };
    });
  }

  async update(
    orgId: string,
    id: string,
    data: Partial<CreatePurchaseBillData>
  ): Promise<PurchaseBill> {
    return await withTenantContext(orgId, async (tx) => {
      const updateData: any = { ...data };
      delete updateData.lines; // Handle lines separately if needed

      const bill = await tx.purchaseBill.update({
        where: { id },
        data: updateData,
        include: {
          lines: true,
        },
      });
      return serializeBill(bill);
    });
  }

  async delete(orgId: string, id: string): Promise<void> {
    await withTenantContext(orgId, async (tx) => {
      await tx.purchaseBill.delete({ where: { id } });
    });
  }

  async attachPdf(
    orgId: string,
    id: string,
    attachmentId: string
  ): Promise<void> {
    await withTenantContext(orgId, async (tx) => {
      await tx.purchaseBill.update({
        where: { id },
        data: { pdfAttachmentId: attachmentId },
      });
    });
  }

  async getRecentBills(orgId: string, limit: number): Promise<PurchaseBill[]> {
    return await withTenantContext(orgId, async (tx) => {
      const bills = await tx.purchaseBill.findMany({
        where: { orgId },
        orderBy: { createdAt: "desc" },
        take: limit,
        include: {
          lines: true,
        },
      });
      return bills.map(serializeBill);
    });
  }
}

export const purchasesRepository = new PurchasesRepositoryImpl();

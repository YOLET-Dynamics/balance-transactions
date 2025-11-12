import { withTenantContext } from "../database/prisma";
import type {
  ISalesRepository,
  CreateSalesInvoiceData,
  SalesInvoice,
  ListOptions,
} from "../../domain/repositories/sales.repository";

// Helper to serialize Prisma data (Decimal -> number, Date -> string)
function serializeInvoice(invoice: any): any {
  if (!invoice) return null;

  return {
    ...invoice,
    subtotal: invoice.subtotal ? Number(invoice.subtotal) : 0,
    vatAmount: invoice.vatAmount ? Number(invoice.vatAmount) : 0,
    total: invoice.total ? Number(invoice.total) : 0,
    withheldPct: invoice.withheldPct ? Number(invoice.withheldPct) : null,
    withheldAmount: invoice.withheldAmount
      ? Number(invoice.withheldAmount)
      : null,
    netPayable: invoice.netPayable ? Number(invoice.netPayable) : 0,
    createdAt: invoice.createdAt ? invoice.createdAt.toISOString() : null,
    updatedAt: invoice.updatedAt ? invoice.updatedAt.toISOString() : null,
    lines:
      invoice.lines?.map((line: any) => ({
        ...line,
        quantity: line.quantity ? Number(line.quantity) : 0,
        unitPrice: line.unitPrice ? Number(line.unitPrice) : 0,
        lineTotal: line.lineTotal ? Number(line.lineTotal) : 0,
      })) || [],
  };
}

export class SalesRepository implements ISalesRepository {
  async create(
    orgId: string,
    data: CreateSalesInvoiceData
  ): Promise<SalesInvoice> {
    return await withTenantContext(orgId, async (tx) => {
      const invoice = await tx.salesInvoice.create({
        data: {
          orgId,
          number: data.number,
          year: data.year,
          seqValue: data.seqValue,

          buyerType: data.buyerType,
          buyerLegalName: data.buyerLegalName,
          buyerTradeName: data.buyerTradeName,
          buyerSubcity: data.buyerSubcity,
          buyerCityRegion: data.buyerCityRegion,
          buyerCountry: data.buyerCountry,
          buyerTin: data.buyerTin,
          buyerVatNumber: data.buyerVatNumber,
          buyerPhone: data.buyerPhone,

          subtotal: data.subtotal,
          vatAmount: data.vatAmount,
          total: data.total,
          totalInWords: data.totalInWords,

          goodsOrService: data.goodsOrService,
          withheldPct: data.withheldPct,
          withheldAmount: data.withheldAmount,
          netPayable: data.netPayable,

          paymentMethod: data.paymentMethod,
          paymentRef: data.paymentRef,

          status: data.status || "Pending",

          createdBy: data.createdBy,
          reviewedBy: data.reviewedBy,
          authorizedBy: data.authorizedBy,
          receivedBy: data.receivedBy,

          notes: data.notes,

          lines: {
            create: data.lines.map((line, index) => ({
              seq: index + 1,
              itemId: line.itemId,
              description: line.description,
              unit: line.unit,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              lineTotal: line.quantity * line.unitPrice,
              isVatApplicable: line.isVatApplicable,
            })),
          },
        },
        include: {
          lines: true,
        },
      });

      return serializeInvoice(invoice);
    });
  }

  async findById(orgId: string, id: string): Promise<SalesInvoice | null> {
    return await withTenantContext(orgId, async (tx) => {
      const invoice = await tx.salesInvoice.findUnique({
        where: { id },
        include: {
          lines: true,
        },
      });
      return serializeInvoice(invoice);
    });
  }

  async findByNumber(
    orgId: string,
    number: string
  ): Promise<SalesInvoice | null> {
    return await withTenantContext(orgId, async (tx) => {
      const invoice = await tx.salesInvoice.findUnique({
        where: { orgId_number: { orgId, number } },
        include: {
          lines: true,
        },
      });
      return serializeInvoice(invoice);
    });
  }

  async list(
    orgId: string,
    options: ListOptions
  ): Promise<{ invoices: SalesInvoice[]; total: number }> {
    return await withTenantContext(orgId, async (tx) => {
      const where: any = { orgId };

      if (options.search) {
        where.OR = [
          { number: { contains: options.search, mode: "insensitive" } },
          { buyerLegalName: { contains: options.search, mode: "insensitive" } },
          { buyerTradeName: { contains: options.search, mode: "insensitive" } },
          { buyerTin: { contains: options.search, mode: "insensitive" } },
        ];
      }

      if (options.status) {
        where.status = options.status as any;
      }

      if (options.year) {
        where.year = options.year;
      }

      if (options.fromDate || options.toDate) {
        where.createdAt = {};
        if (options.fromDate) where.createdAt.gte = options.fromDate;
        if (options.toDate) where.createdAt.lte = options.toDate;
      }

      const [invoices, total] = await Promise.all([
        tx.salesInvoice.findMany({
          where,
          skip: (options.page - 1) * options.limit,
          take: options.limit,
          orderBy: { createdAt: "desc" },
          include: {
            lines: true,
          },
        }),
        tx.salesInvoice.count({ where }),
      ]);

      return {
        invoices: invoices.map(serializeInvoice),
        total,
      };
    });
  }

  async update(
    orgId: string,
    id: string,
    data: Partial<CreateSalesInvoiceData>
  ): Promise<SalesInvoice> {
    return await withTenantContext(orgId, async (tx) => {
      const updateData: any = { ...data };
      delete updateData.lines; // Handle lines separately if needed

      const invoice = await tx.salesInvoice.update({
        where: { id },
        data: updateData,
        include: {
          lines: true,
        },
      });
      return serializeInvoice(invoice);
    });
  }

  async delete(orgId: string, id: string): Promise<void> {
    await withTenantContext(orgId, async (tx) => {
      await tx.salesInvoice.delete({ where: { id } });
    });
  }

  async attachPdf(
    orgId: string,
    id: string,
    attachmentId: string
  ): Promise<void> {
    await withTenantContext(orgId, async (tx) => {
      await tx.salesInvoice.update({
        where: { id },
        data: { pdfAttachmentId: attachmentId },
      });
    });
  }

  async getStats(orgId: string, year: number, month: number) {
    return await withTenantContext(orgId, async (tx) => {
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59);

      // Get previous month for growth calculation
      const startOfPrevMonth = new Date(year, month - 2, 1);
      const endOfPrevMonth = new Date(year, month - 1, 0, 23, 59, 59);

      // Current month stats
      const currentMonthInvoices = await tx.salesInvoice.findMany({
        where: {
          orgId,
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        select: {
          total: true,
          status: true,
        },
      });

      const prevMonthInvoices = await tx.salesInvoice.findMany({
        where: {
          orgId,
          status: "Paid",
          createdAt: {
            gte: startOfPrevMonth,
            lte: endOfPrevMonth,
          },
        },
        select: {
          total: true,
        },
      });

      // Revenue only from Paid invoices
      const totalRevenue = currentMonthInvoices
        .filter((inv) => inv.status === "Paid")
        .reduce((sum, inv) => sum + Number(inv.total), 0);

      const prevMonthRevenue = prevMonthInvoices.reduce(
        (sum, inv) => sum + Number(inv.total),
        0
      );

      // Invoice counts by status
      const paidInvoices = currentMonthInvoices.filter(
        (inv) => inv.status === "Paid"
      ).length;
      const pendingInvoices = currentMonthInvoices.filter(
        (inv) => inv.status === "Pending" || inv.status === "Overdue"
      ).length;
      const draftInvoices = currentMonthInvoices.filter(
        (inv) => inv.status === "Draft"
      ).length;

      const revenueGrowth =
        prevMonthRevenue > 0
          ? ((totalRevenue - prevMonthRevenue) / prevMonthRevenue) * 100
          : 0;

      const currentMonthBills = await tx.purchaseBill.findMany({
        where: {
          orgId,
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        select: {
          total: true,
        },
      });

      const prevMonthBills = await tx.purchaseBill.findMany({
        where: {
          orgId,
          createdAt: {
            gte: startOfPrevMonth,
            lte: endOfPrevMonth,
          },
        },
        select: {
          total: true,
        },
      });

      const totalExpenses = currentMonthBills.reduce(
        (sum, bill) => sum + Number(bill.total),
        0
      );
      const prevMonthExpenses = prevMonthBills.reduce(
        (sum, bill) => sum + Number(bill.total),
        0
      );

      const expensesGrowth =
        prevMonthExpenses > 0
          ? ((totalExpenses - prevMonthExpenses) / prevMonthExpenses) * 100
          : 0;

      return {
        totalRevenue,
        totalInvoices: currentMonthInvoices.length,
        paidInvoices,
        pendingInvoices,
        draftInvoices,
        revenueGrowth: Math.round(revenueGrowth * 10) / 10,
        totalExpenses,
        totalBills: currentMonthBills.length,
        expensesGrowth: Math.round(expensesGrowth * 10) / 10,
      };
    });
  }

  async getRecentInvoices(
    orgId: string,
    limit: number
  ): Promise<SalesInvoice[]> {
    return await withTenantContext(orgId, async (tx) => {
      const invoices = await tx.salesInvoice.findMany({
        where: { orgId },
        orderBy: { createdAt: "desc" },
        take: limit,
        include: {
          lines: true,
        },
      });
      return invoices.map(serializeInvoice);
    });
  }
}

export const salesRepository = new SalesRepository();

import { withTenantContext } from "../database/prisma";
import type {
  ISalesRepository,
  CreateSalesInvoiceData,
  SalesInvoice,
  ListOptions,
} from "../../domain/repositories/sales.repository";
import { NotFoundError } from "@/lib/utils/errors";

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
    invoiceDate: invoice.invoiceDate ? invoice.invoiceDate.toISOString() : null,
    dueDate: invoice.dueDate ? invoice.dueDate.toISOString() : null,
    paidDate: invoice.paidDate ? invoice.paidDate.toISOString() : null,
    createdAt: invoice.createdAt ? invoice.createdAt.toISOString() : null,
    updatedAt: invoice.updatedAt ? invoice.updatedAt.toISOString() : null,
    lines:
      invoice.lines?.map((line: any) => ({
        ...line,
        quantity: line.quantity ? Number(line.quantity) : 0,
        unitPrice: line.unitPrice ? Number(line.unitPrice) : 0,
        lineTotal: line.lineTotal ? Number(line.lineTotal) : 0,
        lineType: line.lineType || "Good",
      })) || [],
  };
}

function stripUndefined<T extends Record<string, unknown>>(data: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  ) as Partial<T>;
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
          kind: data.kind || "Invoice",

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

          invoiceType: data.invoiceType,
          invoiceDate: data.invoiceDate,
          dueDate: data.dueDate,
          paidDate: data.paidDate,
          fiscalReceiptNumber: data.fiscalReceiptNumber,

          status: data.status || "Pending",

          createdBy: data.createdBy,
          reviewedBy: data.reviewedBy,
          authorizedBy: data.authorizedBy,
          receivedBy: data.receivedBy,

          notes: data.notes,

          lines: {
            create: data.lines.map((line: any, index) => ({
              seq: index + 1,
              itemId: line.itemId,
              description: line.description,
              unit: line.unit,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              lineTotal: line.lineTotal,
              lineType: line.lineType,
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
      const invoice = await tx.salesInvoice.findFirst({
        where: { id, orgId },
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

      if (options.kind) {
        where.kind = options.kind as any;
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
      const updateData = stripUndefined({
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
        invoiceType: data.invoiceType,
        invoiceDate: data.invoiceDate,
        dueDate: data.dueDate,
        paidDate: data.paidDate,
        fiscalReceiptNumber: data.fiscalReceiptNumber,
        status: data.status,
        createdBy: data.createdBy,
        reviewedBy: data.reviewedBy,
        authorizedBy: data.authorizedBy,
        receivedBy: data.receivedBy,
        notes: data.notes,
      });

      const result = await tx.salesInvoice.updateMany({
        where: { id, orgId },
        data: updateData,
      });

      if (result.count === 0) {
        throw new NotFoundError("Invoice not found");
      }

      if (data.lines) {
        await tx.salesInvoiceLine.deleteMany({ where: { invoiceId: id } });
        await tx.salesInvoiceLine.createMany({
          data: data.lines.map((line: any, index) => ({
            invoiceId: id,
            seq: index + 1,
            itemId: line.itemId,
            description: line.description,
            unit: line.unit,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            lineTotal: line.lineTotal,
            lineType: line.lineType,
            isVatApplicable: line.isVatApplicable,
          })),
        });
      }

      const invoice = await tx.salesInvoice.findFirst({
        where: { id, orgId },
        include: {
          lines: true,
        },
      });
      return serializeInvoice(invoice);
    });
  }

  async delete(orgId: string, id: string): Promise<void> {
    await withTenantContext(orgId, async (tx) => {
      await tx.salesInvoice.deleteMany({ where: { id, orgId } });
    });
  }

  async attachPdf(
    orgId: string,
    id: string,
    attachmentId: string
  ): Promise<void> {
    await withTenantContext(orgId, async (tx) => {
      await tx.salesInvoice.updateMany({
        where: { id, orgId },
        data: { pdfAttachmentId: attachmentId },
      });
    });
  }

  async getStats(orgId: string, year: number, month: number) {
    return await withTenantContext(orgId, async (tx) => {
      const startOfMonth = new Date(year, month - 1, 1);
      const startOfNextMonth = new Date(year, month, 1);

      const startOfPrevMonth = new Date(year, month - 2, 1);
      const invoiceMonthWhere = {
        orgId,
        kind: "Invoice" as const,
        createdAt: {
          gte: startOfMonth,
          lt: startOfNextMonth,
        },
      };

      const prevInvoiceMonthWhere = {
        orgId,
        kind: "Invoice" as const,
        createdAt: {
          gte: startOfPrevMonth,
          lt: startOfMonth,
        },
      };

      const billMonthWhere = {
        orgId,
        createdAt: {
          gte: startOfMonth,
          lt: startOfNextMonth,
        },
      };

      const prevBillMonthWhere = {
        orgId,
        createdAt: {
          gte: startOfPrevMonth,
          lt: startOfMonth,
        },
      };

      const [
        currentRevenue,
        previousRevenue,
        totalInvoices,
        paidInvoices,
        pendingInvoices,
        overdueInvoices,
        draftInvoices,
        currentExpenses,
        previousExpenses,
        totalBills,
      ] = await Promise.all([
        tx.salesInvoice.aggregate({
          where: { ...invoiceMonthWhere, status: "Paid" },
          _sum: { total: true },
        }),
        tx.salesInvoice.aggregate({
          where: { ...prevInvoiceMonthWhere, status: "Paid" },
          _sum: { total: true },
        }),
        tx.salesInvoice.count({ where: invoiceMonthWhere }),
        tx.salesInvoice.count({
          where: { ...invoiceMonthWhere, status: "Paid" },
        }),
        tx.salesInvoice.count({
          where: { ...invoiceMonthWhere, status: "Pending" },
        }),
        tx.salesInvoice.count({
          where: { ...invoiceMonthWhere, status: "Overdue" },
        }),
        tx.salesInvoice.count({
          where: { ...invoiceMonthWhere, status: "Draft" },
        }),
        tx.purchaseBill.aggregate({
          where: billMonthWhere,
          _sum: { total: true },
        }),
        tx.purchaseBill.aggregate({
          where: prevBillMonthWhere,
          _sum: { total: true },
        }),
        tx.purchaseBill.count({ where: billMonthWhere }),
      ]);

      const totalRevenue = Number(currentRevenue._sum.total || 0);
      const prevMonthRevenue = Number(previousRevenue._sum.total || 0);
      const totalExpenses = Number(currentExpenses._sum.total || 0);
      const prevMonthExpenses = Number(previousExpenses._sum.total || 0);
      const payableInvoiceCount = pendingInvoices + overdueInvoices;

      const revenueGrowth =
        prevMonthRevenue > 0
          ? ((totalRevenue - prevMonthRevenue) / prevMonthRevenue) * 100
          : 0;

      const expensesGrowth =
        prevMonthExpenses > 0
          ? ((totalExpenses - prevMonthExpenses) / prevMonthExpenses) * 100
          : 0;

      return {
        totalRevenue,
        totalInvoices,
        paidInvoices,
        pendingInvoices: payableInvoiceCount,
        draftInvoices,
        revenueGrowth: Math.round(revenueGrowth * 10) / 10,
        totalExpenses,
        totalBills,
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
        where: { orgId, kind: "Invoice" },
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          orgId: true,
          number: true,
          year: true,
          seqValue: true,
          kind: true,
          buyerLegalName: true,
          buyerTradeName: true,
          currency: true,
          subtotal: true,
          vatAmount: true,
          total: true,
          totalInWords: true,
          goodsOrService: true,
          withheldPct: true,
          withheldAmount: true,
          netPayable: true,
          paymentMethod: true,
          paymentRef: true,
          invoiceType: true,
          invoiceDate: true,
          dueDate: true,
          paidDate: true,
          fiscalReceiptNumber: true,
          status: true,
          notes: true,
          pdfAttachmentId: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return invoices.map(serializeInvoice);
    });
  }
}

export const salesRepository = new SalesRepository();

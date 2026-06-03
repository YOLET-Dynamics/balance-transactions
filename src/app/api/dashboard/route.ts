import { createRoute } from "@/lib/api/route-handler";
import { withTenantContext } from "@/infrastructure/database/prisma";

function money(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  if (
    typeof value === "object" &&
    value !== null &&
    "toNumber" in value &&
    typeof value.toNumber === "function"
  ) {
    return value.toNumber();
  }
  return Number(value) || 0;
}

function monthStart(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function addMonths(date: Date, months: number): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1)
  );
}

function percentGrowth(current: number, previous: number): number {
  if (previous <= 0) return 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function ageBucket(date: Date, now: Date): "current" | "d0_30" | "d31_60" | "d61_90" | "d90Plus" {
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) return "current";
  if (diffDays <= 30) return "d0_30";
  if (diffDays <= 60) return "d31_60";
  if (diffDays <= 90) return "d61_90";
  return "d90Plus";
}

function emptyAging() {
  return {
    current: 0,
    d0_30: 0,
    d31_60: 0,
    d61_90: 0,
    d90Plus: 0,
    total: 0,
  };
}

export const GET = createRoute(
  async ({ auth }) => {
    const now = new Date();
    const currentMonthStart = monthStart(now);
    const nextMonthStart = addMonths(currentMonthStart, 1);
    const previousMonthStart = addMonths(currentMonthStart, -1);
    const trendStart = addMonths(currentMonthStart, -5);

    const dashboard = await withTenantContext(auth!.orgId, async (tx) => {
      const [
        monthlySales,
        previousSales,
        monthlyExpenses,
        previousExpenses,
        invoiceStatusCounts,
        recentInvoices,
        openInvoices,
        invoicePaymentSums,
        openBills,
        billPaymentSums,
        taxSummary,
        recentPayments,
        monthlyTrend,
      ] = await Promise.all([
        tx.salesInvoice.aggregate({
          where: {
            orgId: auth!.orgId,
            kind: "Invoice",
            status: "Paid",
            createdAt: { gte: currentMonthStart, lt: nextMonthStart },
          },
          _sum: { total: true },
        }),
        tx.salesInvoice.aggregate({
          where: {
            orgId: auth!.orgId,
            kind: "Invoice",
            status: "Paid",
            createdAt: { gte: previousMonthStart, lt: currentMonthStart },
          },
          _sum: { total: true },
        }),
        tx.purchaseBill.aggregate({
          where: {
            orgId: auth!.orgId,
            createdAt: { gte: currentMonthStart, lt: nextMonthStart },
          },
          _sum: { total: true },
        }),
        tx.purchaseBill.aggregate({
          where: {
            orgId: auth!.orgId,
            createdAt: { gte: previousMonthStart, lt: currentMonthStart },
          },
          _sum: { total: true },
        }),
        tx.salesInvoice.groupBy({
          by: ["status"],
          where: {
            orgId: auth!.orgId,
            kind: "Invoice",
            createdAt: { gte: currentMonthStart, lt: nextMonthStart },
          },
          _count: { _all: true },
        }),
        tx.salesInvoice.findMany({
          where: { orgId: auth!.orgId, kind: "Invoice" },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            number: true,
            buyerLegalName: true,
            buyerTradeName: true,
            total: true,
            invoiceType: true,
            status: true,
            createdAt: true,
          },
        }),
        tx.salesInvoice.findMany({
          where: {
            orgId: auth!.orgId,
            kind: "Invoice",
            status: { in: ["Pending", "Overdue"] },
          },
          orderBy: { dueDate: "asc" },
          take: 100,
          select: {
            id: true,
            number: true,
            buyerLegalName: true,
            buyerTradeName: true,
            dueDate: true,
            netPayable: true,
          },
        }),
        tx.payment.groupBy({
          by: ["relatedId"],
          where: {
            orgId: auth!.orgId,
            direction: "Incoming",
            relatedType: "Invoice",
            relatedId: { not: null },
          },
          _sum: { amount: true },
        }),
        tx.purchaseBill.findMany({
          where: {
            orgId: auth!.orgId,
            status: { in: ["Pending", "Overdue"] },
          },
          orderBy: { createdAt: "asc" },
          take: 100,
          select: {
            id: true,
            number: true,
            vendorLegalName: true,
            vendorTradeName: true,
            createdAt: true,
            netPaid: true,
          },
        }),
        tx.payment.groupBy({
          by: ["relatedId"],
          where: {
            orgId: auth!.orgId,
            direction: "Outgoing",
            relatedType: "Bill",
            relatedId: { not: null },
          },
          _sum: { amount: true },
        }),
        Promise.all([
          tx.salesInvoice.aggregate({
            where: {
              orgId: auth!.orgId,
              kind: "Invoice",
              createdAt: { gte: currentMonthStart, lt: nextMonthStart },
            },
            _sum: { vatAmount: true, withheldAmount: true },
          }),
          tx.purchaseBill.aggregate({
            where: {
              orgId: auth!.orgId,
              createdAt: { gte: currentMonthStart, lt: nextMonthStart },
            },
            _sum: { vatAmount: true, withheldAmount: true },
          }),
        ]),
        tx.payment.findMany({
          where: { orgId: auth!.orgId },
          orderBy: { createdAt: "desc" },
          take: 6,
          select: {
            id: true,
            direction: true,
            method: true,
            amount: true,
            relatedType: true,
            advanceReceiptNumber: true,
            createdAt: true,
          },
        }),
        tx.$queryRaw<
          Array<{
            month: Date;
            sales: unknown;
            purchases: unknown;
          }>
        >`
          SELECT
            months.month::date AS month,
            COALESCE(sales.sales, 0) AS sales,
            COALESCE(purchases.purchases, 0) AS purchases
          FROM generate_series(${trendStart}, ${currentMonthStart}, interval '1 month') AS months(month)
          LEFT JOIN (
            SELECT date_trunc('month', created_at) AS month, SUM(total) AS sales
            FROM sales_invoices
            WHERE org_id = ${auth!.orgId}::uuid
              AND kind = 'Invoice'
              AND status = 'Paid'
              AND created_at >= ${trendStart}
              AND created_at < ${nextMonthStart}
            GROUP BY 1
          ) sales ON sales.month = months.month
          LEFT JOIN (
            SELECT date_trunc('month', created_at) AS month, SUM(total) AS purchases
            FROM purchase_bills
            WHERE org_id = ${auth!.orgId}::uuid
              AND created_at >= ${trendStart}
              AND created_at < ${nextMonthStart}
            GROUP BY 1
          ) purchases ON purchases.month = months.month
          ORDER BY months.month ASC
        `,
      ]);

      const paymentByInvoiceId = new Map(
        invoicePaymentSums.map((payment) => [
          payment.relatedId,
          money(payment._sum.amount),
        ])
      );
      const paymentByBillId = new Map(
        billPaymentSums.map((payment) => [
          payment.relatedId,
          money(payment._sum.amount),
        ])
      );
      const receivablesAging = emptyAging();
      const payablesAging = emptyAging();

      const overdueInvoices = openInvoices
        .map((invoice) => {
          const paid = paymentByInvoiceId.get(invoice.id) || 0;
          const outstanding = Math.max(money(invoice.netPayable) - paid, 0);
          receivablesAging[ageBucket(invoice.dueDate, now)] += outstanding;
          receivablesAging.total += outstanding;

          return {
            id: invoice.id,
            number: invoice.number,
            party:
              invoice.buyerLegalName || invoice.buyerTradeName || "Customer",
            amount: outstanding,
            dueDate: invoice.dueDate.toISOString().split("T")[0],
            daysOverdue: Math.max(
              Math.floor(
                (now.getTime() - invoice.dueDate.getTime()) /
                  (1000 * 60 * 60 * 24)
              ),
              0
            ),
          };
        })
        .filter((invoice) => invoice.amount > 0 && invoice.daysOverdue > 0)
        .slice(0, 5);

      const overdueBills = openBills
        .map((bill) => {
          const paid = paymentByBillId.get(bill.id) || 0;
          const outstanding = Math.max(money(bill.netPaid) - paid, 0);
          payablesAging[ageBucket(bill.createdAt, now)] += outstanding;
          payablesAging.total += outstanding;

          return {
            id: bill.id,
            number: bill.number,
            party: bill.vendorLegalName || bill.vendorTradeName || "Vendor",
            amount: outstanding,
            billDate: bill.createdAt.toISOString().split("T")[0],
            daysOpen: Math.max(
              Math.floor(
                (now.getTime() - bill.createdAt.getTime()) /
                  (1000 * 60 * 60 * 24)
              ),
              0
            ),
          };
        })
        .filter((bill) => bill.amount > 0 && bill.daysOpen >= 30)
        .slice(0, 5);

      const statusCounts = Object.fromEntries(
        invoiceStatusCounts.map((count) => [count.status, count._count._all])
      );
      const totalRevenue = money(monthlySales._sum.total);
      const totalExpenses = money(monthlyExpenses._sum.total);
      const [salesTax, purchaseTax] = taxSummary;

      return {
        stats: {
          totalRevenue,
          totalExpenses,
          revenueGrowth: percentGrowth(
            totalRevenue,
            money(previousSales._sum.total)
          ),
          expensesGrowth: percentGrowth(
            totalExpenses,
            money(previousExpenses._sum.total)
          ),
          totalInvoices: Object.values(statusCounts).reduce(
            (sum, count) => sum + Number(count),
            0
          ),
          paidInvoices: Number(statusCounts.Paid || 0),
          pendingInvoices:
            Number(statusCounts.Pending || 0) + Number(statusCounts.Overdue || 0),
          draftInvoices: Number(statusCounts.Draft || 0),
        },
        recentInvoices: recentInvoices.map((invoice) => ({
          id: invoice.id,
          number: invoice.number,
          customer:
            invoice.buyerLegalName || invoice.buyerTradeName || "Customer",
          amount: money(invoice.total),
          documentLabel:
            invoice.invoiceType === "Cash"
              ? "Cash Sales Attachment"
              : "Credit Invoice",
          status: invoice.status.toLowerCase(),
          date: invoice.createdAt.toISOString().split("T")[0],
        })),
        summary: {
          sales: totalRevenue,
          expenses: totalExpenses,
          netProfit: totalRevenue - totalExpenses,
        },
        aging: {
          receivables: receivablesAging,
          payables: payablesAging,
        },
        overdueAlerts: {
          invoices: overdueInvoices,
          bills: overdueBills,
        },
        taxSummary: {
          salesVat: money(salesTax._sum.vatAmount),
          salesWht: money(salesTax._sum.withheldAmount),
          purchaseVat: money(purchaseTax._sum.vatAmount),
          purchaseWht: money(purchaseTax._sum.withheldAmount),
        },
        recentCashActivity: recentPayments.map((payment) => ({
          id: payment.id,
          direction: payment.direction,
          method: payment.method,
          amount: money(payment.amount),
          relatedType: payment.relatedType,
          advanceReceiptNumber: payment.advanceReceiptNumber,
          date: payment.createdAt.toISOString().split("T")[0],
        })),
        monthlyTrend: monthlyTrend.map((month) => {
          const monthDate =
            month.month instanceof Date ? month.month : new Date(month.month);

          return {
            month: monthDate.toLocaleString("en", { month: "short" }),
            sales: money(month.sales),
            purchases: money(month.purchases),
          };
        }),
      };
    });

    return dashboard;
  },
  {
    requireAuth: true,
    rateLimit: "queries",
  }
);

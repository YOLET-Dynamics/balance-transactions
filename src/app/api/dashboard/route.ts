import { createRoute } from "@/lib/api/route-handler";
import { salesService } from "@/application/services/sales.service";

export const GET = createRoute(
  async ({ auth }) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const stats = await salesService.getStats(
      auth!.orgId,
      currentYear,
      currentMonth
    );

    const recentInvoices = await salesService.getRecentInvoices(auth!.orgId, 5);

    return {
      stats: {
        totalRevenue: stats.totalRevenue,
        totalExpenses: stats.totalExpenses,
        revenueGrowth: stats.revenueGrowth,
        expensesGrowth: stats.expensesGrowth,
        totalInvoices: stats.totalInvoices,
        paidInvoices: stats.paidInvoices,
        pendingInvoices: stats.pendingInvoices,
      },
      recentInvoices: recentInvoices.map((inv) => ({
        id: inv.id,
        number: inv.number,
        customer: inv.buyerLegalName || inv.buyerTradeName || "N/A",
        amount: Number(inv.total),
        status: inv.status.toLowerCase(),
        date: inv.createdAt?.split("T")[0] || "",
      })),
      summary: {
        sales: stats.totalRevenue,
        expenses: stats.totalExpenses,
        netProfit: stats.totalRevenue - stats.totalExpenses,
      },
    };
  },
  {
    requireAuth: true,
    rateLimit: "queries",
  }
);

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  revenueGrowth: number;
  expensesGrowth: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  draftInvoices: number;
}

interface RecentInvoice {
  id: string;
  number: string;
  customer: string;
  amount: number;
  documentLabel: string;
  status: string;
  date: string;
}

interface DashboardSummary {
  sales: number;
  expenses: number;
  netProfit: number;
}

interface AgingBuckets {
  current: number;
  d0_30: number;
  d31_60: number;
  d61_90: number;
  d90Plus: number;
  total: number;
}

interface OverdueInvoiceAlert {
  id: string;
  number: string;
  party: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
}

interface OverdueBillAlert {
  id: string;
  number: string;
  party: string;
  amount: number;
  billDate: string;
  daysOpen: number;
}

interface TaxSummary {
  salesVat: number;
  salesWht: number;
  purchaseVat: number;
  purchaseWht: number;
}

interface RecentCashActivity {
  id: string;
  direction: "Incoming" | "Outgoing";
  method: string;
  amount: number;
  relatedType: "Invoice" | "Bill" | "None";
  advanceReceiptNumber: string | null;
  date: string;
}

interface MonthlyTrend {
  month: string;
  sales: number;
  purchases: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentInvoices: RecentInvoice[];
  summary: DashboardSummary;
  aging: {
    receivables: AgingBuckets;
    payables: AgingBuckets;
  };
  overdueAlerts: {
    invoices: OverdueInvoiceAlert[];
    bills: OverdueBillAlert[];
  };
  taxSummary: TaxSummary;
  recentCashActivity: RecentCashActivity[];
  monthlyTrend: MonthlyTrend[];
}

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.get<DashboardData>("/api/dashboard", { showErrorToast: false }),
    staleTime: 30 * 1000, // 30 seconds
    retry: false,
  });
}

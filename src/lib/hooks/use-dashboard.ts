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
  status: string;
  date: string;
}

interface DashboardSummary {
  sales: number;
  expenses: number;
  netProfit: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentInvoices: RecentInvoice[];
  summary: DashboardSummary;
}

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.get<DashboardData>("/api/dashboard", { showErrorToast: false }),
    staleTime: 30 * 1000, // 30 seconds
    retry: false,
  });
}


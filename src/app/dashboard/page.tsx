"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  TrendingDown,
  Plus,
  FileCheck,
  FileText,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDashboard } from "@/lib/hooks/use-dashboard";

export default function DashboardPage() {
  const router = useRouter();

  const {
    data: dashboardData,
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useDashboard();

  useEffect(() => {
    if (error && (error as any)?.status === 401) {
      router.push("/auth/login");
    }
  }, [error, router]);

  const formatCurrency = (amount: number) => {
    return `ETB ${new Intl.NumberFormat("en-ET", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)}`;
  };

  const formatGrowth = (growth: number) => {
    const sign = growth >= 0 ? "+" : "";
    return `${sign}${growth.toFixed(1)}%`;
  };

  return (
    <div className="p-6 space-y-6">
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-brand-yellow-500 mx-auto" />
            <p className="text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      ) : isError || !dashboardData ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <p className="text-gray-400">Failed to load dashboard data</p>
            <Button
              onClick={() => refetch()}
              className="bg-brand-yellow-500 text-black hover:bg-brand-yellow-600"
            >
              Retry
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => router.push("/dashboard/sales/new")}
              className="bg-brand-yellow-500 text-black hover:bg-brand-yellow-600 font-semibold"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Invoice
            </Button>
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/5"
              disabled
            >
              <Plus className="mr-2 h-4 w-4" />
              New Bill
            </Button>
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/5"
              disabled
            >
              <Plus className="mr-2 h-4 w-4" />
              Record Payment
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">
                  Total Revenue
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(dashboardData.stats.totalRevenue)}
                </div>
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                  {dashboardData.stats.revenueGrowth >= 0 ? (
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-500" />
                  )}
                  <span
                    className={
                      dashboardData.stats.revenueGrowth >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    {formatGrowth(dashboardData.stats.revenueGrowth)}
                  </span>{" "}
                  from last month (paid only)
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500/10 to-transparent border-red-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">
                  Total Expenses
                </CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(dashboardData.stats.totalExpenses)}
                </div>
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                  {dashboardData.stats.expensesGrowth >= 0 ? (
                    <ArrowUpRight className="h-3 w-3 text-red-500" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-green-500" />
                  )}
                  <span
                    className={
                      dashboardData.stats.expensesGrowth >= 0
                        ? "text-red-500"
                        : "text-green-500"
                    }
                  >
                    {formatGrowth(dashboardData.stats.expensesGrowth)}
                  </span>{" "}
                  from last month
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-brand-yellow-500/10 to-transparent border-brand-yellow-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">
                  Pending Invoices
                </CardTitle>
                <Clock className="h-4 w-4 text-brand-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {dashboardData.stats.pendingInvoices}
                </div>
                <p className="text-xs text-gray-400 mt-1">Awaiting payment</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">
                  Paid Invoices
                </CardTitle>
                <FileCheck className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {dashboardData.stats.paidInvoices}
                </div>
                <p className="text-xs text-gray-400 mt-1">This month</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-500/10 to-transparent border-gray-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">
                  Draft Invoices
                </CardTitle>
                <FileText className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {dashboardData.stats.draftInvoices}
                </div>
                <p className="text-xs text-gray-400 mt-1">Unpublished</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Invoices */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">
                      Recent Invoices
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Latest sales transactions
                    </CardDescription>
                  </div>
                  <Link
                    href="/dashboard/sales"
                    className="text-sm text-brand-yellow-500 hover:text-brand-yellow-600 font-medium"
                  >
                    View all
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.recentInvoices.length > 0 ? (
                    dashboardData.recentInvoices.map((invoice) => (
                      <div
                        key={invoice.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">
                            {invoice.customer}
                          </p>
                          <p className="text-xs text-gray-400">
                            {invoice.number} • {invoice.date}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-white">
                            {formatCurrency(invoice.amount)}
                          </p>
                          <p className="text-xs text-gray-400 capitalize">
                            {invoice.status}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm text-gray-400">
                        No recent invoices
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Financial Summary</CardTitle>
                <CardDescription className="text-gray-400">
                  This month's overview
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-300">
                        Sales
                      </span>
                      <span className="text-sm font-bold text-green-500">
                        {formatCurrency(dashboardData.summary.sales)}
                      </span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 transition-all"
                        style={{
                          width: `${Math.min(
                            (dashboardData.summary.sales /
                              (dashboardData.summary.sales +
                                dashboardData.summary.expenses || 1)) *
                              100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-300">
                        Expenses
                      </span>
                      <span className="text-sm font-bold text-red-500">
                        {formatCurrency(dashboardData.summary.expenses)}
                      </span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500 transition-all"
                        style={{
                          width: `${Math.min(
                            (dashboardData.summary.expenses /
                              (dashboardData.summary.sales +
                                dashboardData.summary.expenses || 1)) *
                              100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-300">
                        Net Profit
                      </span>
                      <span className="text-lg font-bold text-brand-yellow-500">
                        {formatCurrency(dashboardData.summary.netProfit)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

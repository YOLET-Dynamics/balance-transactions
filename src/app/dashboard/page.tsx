"use client";

import { useEffect, type ComponentType, type ReactElement } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  FileCheck,
  FileText,
  Loader2,
  Plus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDashboard, type DashboardData } from "@/lib/hooks/use-dashboard";
import type { ExtendedError } from "@/lib/api/client";

function formatCurrency(amount: number): string {
  return `ETB ${new Intl.NumberFormat("en-ET", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
}

function formatGrowth(growth: number): string {
  const sign = growth >= 0 ? "+" : "";
  return `${sign}${growth.toFixed(1)}%`;
}

function percent(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min((value / total) * 100, 100);
}

type StatCardProps = {
  title: string;
  value: string | number;
  description: string;
  tone: "green" | "red" | "yellow" | "blue" | "gray";
  growth?: number;
  icon: ComponentType<{ className?: string }>;
};

const statToneClass = {
  green: "from-green-500/10 border-green-500/20 text-green-500",
  red: "from-red-500/10 border-red-500/20 text-red-500",
  yellow: "from-brand-yellow-500/10 border-brand-yellow-500/20 text-brand-yellow-500",
  blue: "from-blue-500/10 border-blue-500/20 text-blue-500",
  gray: "from-gray-500/10 border-gray-500/20 text-gray-400",
};

const statIconToneClass = {
  green: "text-green-500",
  red: "text-red-500",
  yellow: "text-brand-yellow-500",
  blue: "text-blue-500",
  gray: "text-gray-400",
};

function StatCard({
  title,
  value,
  description,
  tone,
  growth,
  icon: Icon,
}: StatCardProps): ReactElement {
  return (
    <Card className={`bg-gradient-to-br to-transparent ${statToneClass[tone]}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-300">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${statIconToneClass[tone]}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
        <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
          {growth !== undefined ? (
            growth >= 0 ? (
              <ArrowUpRight className="h-3 w-3 text-green-500" />
            ) : (
              <ArrowDownRight className="h-3 w-3 text-red-500" />
            )
          ) : null}
          {growth !== undefined ? (
            <span className={growth >= 0 ? "text-green-500" : "text-red-500"}>
              {formatGrowth(growth)}
            </span>
          ) : null}
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

function AgingBars({
  title,
  description,
  buckets,
}: {
  title: string;
  description: string;
  buckets: DashboardData["aging"]["receivables"];
}): ReactElement {
  const rows = [
    ["Current", buckets.current],
    ["0-30 days", buckets.d0_30],
    ["31-60 days", buckets.d31_60],
    ["61-90 days", buckets.d61_90],
    ["90+ days", buckets.d90Plus],
  ] as const;

  return (
    <Card className="border-white/10 bg-white/5">
      <CardHeader>
        <CardTitle className="text-white">{title}</CardTitle>
        <CardDescription className="text-gray-400">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {rows.map(([label, amount]) => (
          <div key={label} className="space-y-2">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-gray-300">{label}</span>
              <span className="font-medium text-white">
                {formatCurrency(amount)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-brand-yellow-500"
                style={{ width: `${percent(amount, buckets.total)}%` }}
              />
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <span className="text-sm font-medium text-gray-300">Total open</span>
          <span className="text-lg font-bold text-white">
            {formatCurrency(buckets.total)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function AlertPanel({
  data,
}: {
  data: DashboardData["overdueAlerts"];
}): ReactElement {
  const hasAlerts = data.invoices.length > 0 || data.bills.length > 0;

  return (
    <Card className="border-red-500/20 bg-red-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          Overdue Alerts
        </CardTitle>
        <CardDescription className="text-gray-400">
          Open receivables and old unpaid purchase bills
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {!hasAlerts ? (
          <p className="py-6 text-center text-sm text-gray-400">
            No overdue sales or old unpaid purchase bills.
          </p>
        ) : null}
        {data.invoices.map((invoice) => (
          <Link
            key={invoice.id}
            href={`/dashboard/sales/${invoice.id}`}
            className="block rounded-lg border border-white/10 bg-white/5 p-3 transition-colors hover:bg-white/10"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {invoice.party}
                </p>
                <p className="text-xs text-gray-400">
                  {invoice.number} · {invoice.daysOverdue} days overdue
                </p>
              </div>
              <span className="whitespace-nowrap text-sm font-semibold text-red-300">
                {formatCurrency(invoice.amount)}
              </span>
            </div>
          </Link>
        ))}
        {data.bills.map((bill) => (
          <Link
            key={bill.id}
            href={`/dashboard/purchases/${bill.id}`}
            className="block rounded-lg border border-white/10 bg-white/5 p-3 transition-colors hover:bg-white/10"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {bill.party}
                </p>
                <p className="text-xs text-gray-400">
                  {bill.number} · open for {bill.daysOpen} days
                </p>
              </div>
              <span className="whitespace-nowrap text-sm font-semibold text-red-300">
                {formatCurrency(bill.amount)}
              </span>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

function TaxSummaryPanel({
  taxSummary,
}: {
  taxSummary: DashboardData["taxSummary"];
}): ReactElement {
  const rows = [
    ["Sales VAT collected", taxSummary.salesVat, "text-blue-300"],
    ["Sales WHT deducted", taxSummary.salesWht, "text-red-300"],
    ["Purchase VAT paid", taxSummary.purchaseVat, "text-blue-300"],
    ["Purchase WHT withheld", taxSummary.purchaseWht, "text-red-300"],
  ] as const;

  return (
    <Card className="border-white/10 bg-white/5">
      <CardHeader>
        <CardTitle className="text-white">VAT/WHT Summary</CardTitle>
        <CardDescription className="text-gray-400">
          This month, based on saved documents
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map(([label, amount, color]) => (
          <div key={label} className="flex items-center justify-between gap-3">
            <span className="text-sm text-gray-300">{label}</span>
            <span className={`text-sm font-semibold ${color}`}>
              {formatCurrency(amount)}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function TrendPanel({
  trend,
}: {
  trend: DashboardData["monthlyTrend"];
}): ReactElement {
  const max = Math.max(
    ...trend.map((item) => Math.max(item.sales, item.purchases)),
    1
  );

  return (
    <Card className="border-white/10 bg-white/5">
      <CardHeader>
        <CardTitle className="text-white">Sales vs Purchases</CardTitle>
        <CardDescription className="text-gray-400">
          Paid sales and recorded purchases over six months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-6 items-end gap-3">
          {trend.map((item) => (
            <div key={item.month} className="space-y-2">
              <div className="flex h-32 items-end justify-center gap-1">
                <div
                  className="w-full max-w-5 rounded-t bg-green-500"
                  style={{ height: `${Math.max(percent(item.sales, max), 4)}%` }}
                  title={`Sales ${formatCurrency(item.sales)}`}
                />
                <div
                  className="w-full max-w-5 rounded-t bg-red-500"
                  style={{
                    height: `${Math.max(percent(item.purchases, max), 4)}%`,
                  }}
                  title={`Purchases ${formatCurrency(item.purchases)}`}
                />
              </div>
              <p className="text-center text-xs text-gray-400">{item.month}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Sales
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            Purchases
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function CashActivityPanel({
  payments,
}: {
  payments: DashboardData["recentCashActivity"];
}): ReactElement {
  return (
    <Card className="border-white/10 bg-white/5">
      <CardHeader>
        <CardTitle className="text-white">Recent Cash Activity</CardTitle>
        <CardDescription className="text-gray-400">
          Latest incoming and outgoing payments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {payments.length > 0 ? (
          payments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between gap-3 rounded-lg bg-white/5 p-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-white">
                  {payment.direction === "Incoming" ? "Received" : "Paid"} ·{" "}
                  {payment.method}
                </p>
                <p className="text-xs text-gray-400">
                  {payment.relatedType}
                  {payment.advanceReceiptNumber
                    ? ` · Advance ${payment.advanceReceiptNumber}`
                    : ""}{" "}
                  · {payment.date}
                </p>
              </div>
              <span
                className={
                  payment.direction === "Incoming"
                    ? "text-sm font-semibold text-green-300"
                    : "text-sm font-semibold text-red-300"
                }
              >
                {payment.direction === "Incoming" ? "+" : "-"}
                {formatCurrency(payment.amount)}
              </span>
            </div>
          ))
        ) : (
          <p className="py-8 text-center text-sm text-gray-400">
            No payments recorded yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function RecentInvoicesPanel({
  invoices,
}: {
  invoices: DashboardData["recentInvoices"];
}): ReactElement {
  return (
    <Card className="border-white/10 bg-white/5">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-white">Recent Sales Documents</CardTitle>
            <CardDescription className="text-gray-400">
              Latest credit invoices and cash sales attachments
            </CardDescription>
          </div>
          <Link
            href="/dashboard/sales"
            className="whitespace-nowrap text-sm font-medium text-brand-yellow-500 hover:text-brand-yellow-400"
          >
            View all
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {invoices.length > 0 ? (
          invoices.map((invoice) => (
            <Link
              key={invoice.id}
              href={`/dashboard/sales/${invoice.id}`}
              className="block rounded-lg bg-white/5 p-3 transition-colors hover:bg-white/10"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {invoice.customer}
                  </p>
                  <p className="text-xs text-gray-400">
                    {invoice.number} · {invoice.date}
                  </p>
                  <Badge className="mt-2 border-white/10 bg-white/5 text-xs text-gray-300">
                    {invoice.documentLabel}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">
                    {formatCurrency(invoice.amount)}
                  </p>
                  <p className="text-xs capitalize text-gray-400">
                    {invoice.status}
                  </p>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
              <FileText className="h-6 w-6 text-gray-500" />
            </div>
            <p className="text-sm font-medium text-white">No invoices yet</p>
            <Button
              size="sm"
              asChild
              className="bg-brand-yellow-500 font-semibold text-black hover:bg-brand-yellow-600"
            >
              <Link href="/dashboard/sales/new">
                <Plus className="mr-2 h-4 w-4" />
                New invoice
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FinancialSummaryPanel({
  summary,
}: {
  summary: DashboardData["summary"];
}): ReactElement {
  const total = summary.sales + summary.expenses;

  return (
    <Card className="border-white/10 bg-white/5">
      <CardHeader>
        <CardTitle className="text-white">Financial Summary</CardTitle>
        <CardDescription className="text-gray-400">
          This month's sales and expenses
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="mb-2 flex justify-between">
            <span className="text-sm font-medium text-gray-300">Sales</span>
            <span className="text-sm font-bold text-green-500">
              {formatCurrency(summary.sales)}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-green-500 transition-all"
              style={{ width: `${percent(summary.sales, total)}%` }}
            />
          </div>
        </div>
        <div>
          <div className="mb-2 flex justify-between">
            <span className="text-sm font-medium text-gray-300">Expenses</span>
            <span className="text-sm font-bold text-red-500">
              {formatCurrency(summary.expenses)}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-red-500 transition-all"
              style={{ width: `${percent(summary.expenses, total)}%` }}
            />
          </div>
        </div>
        <div className="border-t border-white/10 pt-4">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-300">
              Net Profit
            </span>
            <span className="text-lg font-bold text-brand-yellow-500">
              {formatCurrency(summary.netProfit)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage(): ReactElement {
  const router = useRouter();
  const {
    data: dashboardData,
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useDashboard();

  useEffect(() => {
    if ((error as ExtendedError | null)?.status === 401) {
      router.push("/auth/login");
    }
  }, [error, router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="space-y-4 text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-brand-yellow-500" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (isError || !dashboardData) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="space-y-4 text-center">
          <p className="text-gray-400">Failed to load dashboard data</p>
          <Button
            onClick={() => refetch()}
            className="bg-brand-yellow-500 text-black hover:bg-brand-yellow-600"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 sm:space-y-6 sm:p-6">
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => router.push("/dashboard/sales/new")}
          className="bg-brand-yellow-500 font-semibold text-black hover:bg-brand-yellow-600"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Sale
        </Button>
        <Button
          onClick={() => router.push("/dashboard/purchases/new")}
          variant="outline"
          className="border-white/20 text-white hover:bg-white/5"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Purchase
        </Button>
        <Button
          onClick={() => router.push("/dashboard/payments/new")}
          variant="outline"
          className="border-white/20 text-white hover:bg-white/5"
        >
          <Plus className="mr-2 h-4 w-4" />
          Record Payment
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(dashboardData.stats.totalRevenue)}
          description="from last month, paid only"
          tone="green"
          growth={dashboardData.stats.revenueGrowth}
          icon={TrendingUp}
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(dashboardData.stats.totalExpenses)}
          description="from last month"
          tone="red"
          growth={dashboardData.stats.expensesGrowth}
          icon={TrendingDown}
        />
        <StatCard
          title="Pending Invoices"
          value={dashboardData.stats.pendingInvoices}
          description="awaiting payment"
          tone="yellow"
          icon={Clock}
        />
        <StatCard
          title="Paid Invoices"
          value={dashboardData.stats.paidInvoices}
          description="this month"
          tone="blue"
          icon={FileCheck}
        />
        <StatCard
          title="Draft Invoices"
          value={dashboardData.stats.draftInvoices}
          description="unpublished"
          tone="gray"
          icon={FileText}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AgingBars
          title="Receivables Aging"
          description="Outstanding sales invoices by due date"
          buckets={dashboardData.aging.receivables}
        />
        <AgingBars
          title="Payables Aging"
          description="Unpaid purchase bills by bill age"
          buckets={dashboardData.aging.payables}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <AlertPanel data={dashboardData.overdueAlerts} />
        <TaxSummaryPanel taxSummary={dashboardData.taxSummary} />
        <CashActivityPanel payments={dashboardData.recentCashActivity} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <TrendPanel trend={dashboardData.monthlyTrend} />
        <FinancialSummaryPanel summary={dashboardData.summary} />
      </div>

      <RecentInvoicesPanel invoices={dashboardData.recentInvoices} />
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useInvoices, type Invoice } from "@/lib/hooks/use-sales";
import { Button } from "@/components/ui/button";
import { axiosInstance } from "@/lib/api/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Plus,
  Download,
  FileText,
  Eye,
  Edit,
  Trash2,
  Loader2,
  ArrowUpDown,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function SalesPage() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const limit = 20;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1); // Reset to first page when search changes
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, error, isLoading, refetch } = useInvoices({
    page,
    limit,
    search: debouncedSearch,
    status: statusFilter,
  });

  const formatCurrency = (amount: number) => {
    return `ETB ${new Intl.NumberFormat("en-ET", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)}`;
  };

  const getStatusBadge = (status: Invoice["status"]) => {
    const styles = {
      Draft: "bg-gray-500/20 text-gray-300 border-gray-500/30",
      Pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      Paid: "bg-green-500/20 text-green-300 border-green-500/30",
      Overdue: "bg-red-500/20 text-red-300 border-red-500/30",
      Cancelled: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    };

    return (
      <Badge variant="outline" className={styles[status]}>
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-brand-yellow-500 mx-auto" />
          <p className="text-gray-400">Loading invoices...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-400">
            Failed to load invoices: {(error as Error).message}
          </p>
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

  const invoices: Invoice[] = data?.invoices || [];
  const totalCount = data?.total || 0;
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Sales Invoices</h1>
          <p className="text-gray-400 mt-1">
            Manage and track your sales transactions
          </p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/sales/new")}
          className="bg-brand-yellow-500 text-black hover:bg-brand-yellow-600 font-semibold"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Invoice
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by invoice number, customer name..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  autoComplete="off"
                />
              </div>
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px] bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">
            Invoices ({totalCount.toLocaleString()})
          </CardTitle>
          <CardDescription className="text-gray-400">
            {totalPages > 1 && `Page ${page} of ${totalPages}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">
                No invoices found
              </h3>
              <p className="text-gray-400 mb-6">
                {debouncedSearch || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Get started by creating your first invoice"}
              </p>
              {!debouncedSearch && statusFilter === "all" && (
                <Button
                  onClick={() => router.push("/dashboard/sales/new")}
                  className="bg-brand-yellow-500 text-black hover:bg-brand-yellow-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Invoice
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-white/5">
                      <TableHead className="text-gray-300">Invoice #</TableHead>
                      <TableHead className="text-gray-300">Customer</TableHead>
                      <TableHead className="text-gray-300">TIN</TableHead>
                      <TableHead className="text-gray-300">Amount</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Created</TableHead>
                      <TableHead className="text-gray-300 text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow
                        key={invoice.id}
                        onClick={() =>
                          router.push(`/dashboard/sales/${invoice.id}`)
                        }
                        className="border-white/10 hover:bg-white/5 cursor-pointer"
                      >
                        <TableCell className="font-medium text-white">
                          {invoice.number}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {invoice.buyerLegalName ||
                            invoice.buyerTradeName ||
                            "—"}
                        </TableCell>
                        <TableCell className="text-gray-400">
                          {invoice.buyerTin || "—"}
                        </TableCell>
                        <TableCell className="text-white font-medium">
                          {formatCurrency(invoice.total)}
                        </TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                        <TableCell className="text-gray-400">
                          {invoice.createdAt
                            ? formatDistanceToNow(new Date(invoice.createdAt), {
                                addSuffix: true,
                              })
                            : "Unknown"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/dashboard/sales/${invoice.id}`);
                              }}
                              className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  const response = await axiosInstance.get(
                                    `/api/sales/${invoice.id}/pdf`,
                                    {
                                      responseType: "blob",
                                    }
                                  );

                                  const blob = response.data;
                                  const url = window.URL.createObjectURL(blob);
                                  const a = document.createElement("a");
                                  a.href = url;
                                  a.download = `invoice-${invoice.number}.pdf`;
                                  document.body.appendChild(a);
                                  a.click();
                                  window.URL.revokeObjectURL(url);
                                  document.body.removeChild(a);
                                } catch (error) {
                                  const errorMessage =
                                    error instanceof Error
                                      ? error.message
                                      : "Failed to download PDF";
                                  alert(`Failed to download: ${errorMessage}`);
                                }
                              }}
                              className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(
                                  `/dashboard/sales/${invoice.id}/edit`
                                );
                              }}
                              className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10"
                              disabled={invoice.status !== "Draft"}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                // TODO: Delete invoice
                              }}
                              className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              disabled={invoice.status !== "Draft"}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
                  <p className="text-sm text-gray-400">
                    Showing {(page - 1) * limit + 1} to{" "}
                    {Math.min(page * limit, totalCount)} of {totalCount}{" "}
                    invoices
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="border-white/20 text-white hover:bg-white/5 disabled:opacity-50"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                      className="border-white/20 text-white hover:bg-white/5 disabled:opacity-50"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

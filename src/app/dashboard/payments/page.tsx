"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePayments, type Payment } from "@/lib/hooks/use-payments";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Plus,
  ArrowDownCircle,
  ArrowUpCircle,
  Loader2,
  FileText,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function PaymentsPage() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [directionFilter, setDirectionFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const limit = 20;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [directionFilter]);

  const { data, isLoading, error, refetch } = usePayments({
    page,
    limit,
    search: debouncedSearch || undefined,
    direction: directionFilter === "all" ? undefined : (directionFilter as any),
  });

  const formatCurrency = (amount: number) => {
    return `ETB ${new Intl.NumberFormat("en-ET", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)}`;
  };

  const getDirectionBadge = (direction: string) => {
    if (direction === "Incoming") {
      return (
        <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
          <ArrowDownCircle className="h-3 w-3 mr-1" />
          Incoming
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
        <ArrowUpCircle className="h-3 w-3 mr-1" />
        Outgoing
      </Badge>
    );
  };

  if (isLoading && !data) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-brand-yellow-500 mx-auto" />
          <p className="text-gray-400">Loading payments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-400">
            Failed to load payments: {(error as Error).message}
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

  const payments: Payment[] = (data as any)?.payments || [];
  const totalCount = (data as any)?.total || 0;
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Payment Vouchers</h1>
          <p className="text-gray-400 mt-1">
            Track and manage all payment transactions
          </p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/payments/new")}
          className="bg-brand-yellow-500 text-black hover:bg-brand-yellow-600 font-semibold"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Payment
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
                  placeholder="Search payments..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Select
                value={directionFilter}
                onValueChange={setDirectionFilter}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="All Directions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Directions</SelectItem>
                  <SelectItem value="Incoming">Incoming</SelectItem>
                  <SelectItem value="Outgoing">Outgoing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">
            Payment Vouchers ({totalCount.toLocaleString()})
          </CardTitle>
          <CardDescription className="text-gray-400">
            {totalPages > 1 && `Page ${page} of ${totalPages}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">
                No payments found
              </h3>
              <p className="text-gray-400 mb-6">
                {debouncedSearch || directionFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Get started by recording your first payment"}
              </p>
              {!debouncedSearch && directionFilter === "all" && (
                <Button
                  onClick={() => router.push("/dashboard/payments/new")}
                  className="bg-brand-yellow-500 text-black hover:bg-brand-yellow-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Payment
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-white/5">
                      <TableHead className="text-gray-300">Direction</TableHead>
                      <TableHead className="text-gray-300">Amount</TableHead>
                      <TableHead className="text-gray-300">Method</TableHead>
                      <TableHead className="text-gray-300">
                        Related To
                      </TableHead>
                      <TableHead className="text-gray-300">
                        Created By
                      </TableHead>
                      <TableHead className="text-gray-300">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow
                        key={payment.id}
                        className="border-white/10 hover:bg-white/5 cursor-pointer"
                        onClick={() =>
                          router.push(`/dashboard/payments/${payment.id}`)
                        }
                      >
                        <TableCell>
                          {getDirectionBadge(payment.direction)}
                        </TableCell>
                        <TableCell className="text-white font-medium">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {payment.method}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {payment.relatedType === "None"
                            ? "Standalone"
                            : payment.relatedType}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {payment.createdBy || "—"}
                        </TableCell>
                        <TableCell className="text-gray-400">
                          {payment.createdAt
                            ? formatDistanceToNow(new Date(payment.createdAt), {
                                addSuffix: true,
                              })
                            : "Unknown"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-4">
                  <div className="text-sm text-gray-400">
                    Showing {(page - 1) * limit + 1} to{" "}
                    {Math.min(page * limit, totalCount)} of {totalCount}{" "}
                    payments
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      variant="outline"
                      size="sm"
                      className="border-white/20 text-white hover:bg-white/5 disabled:opacity-50"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                      variant="outline"
                      size="sm"
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

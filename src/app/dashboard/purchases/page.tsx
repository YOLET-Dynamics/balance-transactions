"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePurchaseBills, type PurchaseBill } from "@/lib/hooks/use-purchases";
import { Button } from "@/components/ui/button";
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
  Search,
  Plus,
  FileText,
  Eye,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function PurchasesPage() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
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

  const { data, error, isLoading, refetch } = usePurchaseBills({
    page,
    limit,
    search: debouncedSearch,
  });

  const formatCurrency = (amount: number) => {
    return `ETB ${new Intl.NumberFormat("en-ET", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)}`;
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-brand-yellow-500 mx-auto" />
          <p className="text-gray-400">Loading purchase bills...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-400">
            Failed to load purchase bills: {(error as Error).message}
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

  const bills: PurchaseBill[] = data?.bills || [];
  const totalCount = data?.total || 0;
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Purchase Bills</h1>
          <p className="text-gray-400 mt-1">
            Manage and track your purchase expenses
          </p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/purchases/new")}
          className="bg-brand-yellow-500 text-black hover:bg-brand-yellow-600 font-semibold"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Purchase Bill
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
                  placeholder="Search by bill number, vendor name..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  autoComplete="off"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">
            Bills ({totalCount.toLocaleString()})
          </CardTitle>
          <CardDescription className="text-gray-400">
            {totalPages > 1 && `Page ${page} of ${totalPages}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bills.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">
                No purchase bills found
              </h3>
              <p className="text-gray-400 mb-6">
                {debouncedSearch
                  ? "Try adjusting your search"
                  : "Get started by recording your first purchase"}
              </p>
              {!debouncedSearch && (
                <Button
                  onClick={() => router.push("/dashboard/purchases/new")}
                  className="bg-brand-yellow-500 text-black hover:bg-brand-yellow-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Purchase Bill
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-gray-300">Bill Number</TableHead>
                      <TableHead className="text-gray-300">Vendor</TableHead>
                      <TableHead className="text-gray-300">Reason</TableHead>
                      <TableHead className="text-gray-300">Amount</TableHead>
                      <TableHead className="text-gray-300">Date</TableHead>
                      <TableHead className="text-gray-300 text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bills.map((bill) => (
                      <TableRow
                        key={bill.id}
                        className="border-white/10 hover:bg-white/5 cursor-pointer"
                        onClick={() => router.push(`/dashboard/purchases/${bill.id}`)}
                      >
                        <TableCell className="font-medium text-white">
                          {bill.number}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-white font-medium">
                              {bill.vendorLegalName || "N/A"}
                            </p>
                            {bill.vendorTradeName && (
                              <p className="text-sm text-gray-400">
                                {bill.vendorTradeName}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300 max-w-xs truncate">
                          {bill.reason}
                        </TableCell>
                        <TableCell className="text-white font-medium">
                          {formatCurrency(bill.total)}
                        </TableCell>
                        <TableCell className="text-gray-400">
                          {bill.createdAt
                            ? formatDistanceToNow(new Date(bill.createdAt), {
                                addSuffix: true,
                              })
                            : "Unknown"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-gray-400 hover:text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/dashboard/purchases/${bill.id}`);
                              }}
                            >
                              <Eye className="h-4 w-4" />
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
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="border-white/10 text-white hover:bg-white/5"
                  >
                    Previous
                  </Button>
                  <div className="text-sm text-gray-400">
                    Page {page} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="border-white/10 text-white hover:bg-white/5"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

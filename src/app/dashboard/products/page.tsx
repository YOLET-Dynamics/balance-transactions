"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useCreateItem,
  useItems,
  useUpdateItem,
  type Item,
} from "@/lib/hooks/use-items";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Plus,
  Loader2,
  Package,
  Edit,
  Archive,
  CheckCircle,
  XCircle,
  Copy,
  RotateCcw,
  Save,
  X,
} from "lucide-react";

type ArchiveTarget = {
  id: string;
  name: string;
  isActive: boolean;
};

export default function ProductsPage() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<string>("active");
  const [page, setPage] = useState(1);
  const [archiveTarget, setArchiveTarget] = useState<ArchiveTarget | null>(
    null
  );
  const [editingPrice, setEditingPrice] = useState<{
    id: string;
    value: string;
  } | null>(null);
  const limit = 20;

  const createProduct = useCreateItem();
  const updateProduct = useUpdateItem();

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
  }, [typeFilter, activeFilter]);

  const { data, isLoading, error, refetch } = useItems({
    page,
    limit,
    search: debouncedSearch || undefined,
    type:
      typeFilter === "Good" || typeFilter === "Service"
        ? typeFilter
        : undefined,
    isActive: activeFilter === "all" ? undefined : activeFilter === "active",
  });

  const formatCurrency = (amount: number) => {
    return `ETB ${new Intl.NumberFormat("en-ET", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)}`;
  };

  const handleArchiveToggle = () => {
    if (!archiveTarget) return;
    updateProduct.mutate(
      {
        id: archiveTarget.id,
        data: { isActive: !archiveTarget.isActive },
      },
      {
        onSuccess: () => {
          setArchiveTarget(null);
          refetch();
        },
      }
    );
  };

  const handleDuplicate = (product: Item) => {
    createProduct.mutate({
      type: product.type,
      name: `${product.name} Copy`,
      description: product.description || undefined,
      unit: product.unit,
      sku: product.sku ? `${product.sku}-copy` : undefined,
      barcode: product.barcode || undefined,
      defaultPrice: product.defaultPrice,
      vatApplicable: product.vatApplicable,
      isActive: true,
    });
  };

  const handlePriceSave = (product: Item) => {
    if (!editingPrice || editingPrice.id !== product.id) return;

    const nextPrice = Number(editingPrice.value);
    if (!Number.isFinite(nextPrice) || nextPrice < 0) return;

    updateProduct.mutate(
      {
        id: product.id,
        data: { defaultPrice: nextPrice },
      },
      {
        onSuccess: () => {
          setEditingPrice(null);
          refetch();
        },
      }
    );
  };

  const handleReactivate = (product: Item) => {
    updateProduct.mutate(
      {
        id: product.id,
        data: { isActive: true },
      },
      {
        onSuccess: () => {
          refetch();
        },
      }
    );
  };

  if (isLoading && !data) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-brand-yellow-500 mx-auto" />
          <p className="text-gray-400">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-400">
            Failed to load products: {(error as Error).message}
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

  const products: Item[] = data?.items || [];
  const totalCount = data?.total || 0;
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Products & Services</h1>
          <p className="text-gray-400 mt-1 text-sm sm:text-base">
            Manage your product catalog for quick invoicing
          </p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/products/new")}
          className="bg-brand-yellow-500 text-black hover:bg-brand-yellow-600 font-semibold text-sm"
          size="sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Product
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
                  placeholder="Search products..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="sm:w-40">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Good">Goods</SelectItem>
                  <SelectItem value="Service">Services</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:w-40">
              <Select value={activeFilter} onValueChange={setActiveFilter}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                  <SelectItem value="all">All Status</SelectItem>
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
            Products ({totalCount.toLocaleString()})
          </CardTitle>
          <CardDescription className="text-gray-400">
            {totalPages > 1 && `Page ${page} of ${totalPages}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">
                No products found
              </h3>
              <p className="text-gray-400 mb-6">
                {debouncedSearch || typeFilter !== "all" || activeFilter !== "active"
                  ? "Try adjusting your filters"
                  : "Get started by creating your first product"}
              </p>
              {!debouncedSearch && typeFilter === "all" && activeFilter === "active" && (
                <Button
                  onClick={() => router.push("/dashboard/products/new")}
                  className="bg-brand-yellow-500 text-black hover:bg-brand-yellow-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Product
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-white/5">
                      <TableHead className="text-gray-300">Code</TableHead>
                      <TableHead className="text-gray-300">Name</TableHead>
                      <TableHead className="text-gray-300">Type</TableHead>
                      <TableHead className="text-gray-300">Unit</TableHead>
                      <TableHead className="text-gray-300">Price</TableHead>
                      <TableHead className="text-gray-300">VAT</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow
                        key={product.id}
                        className="border-white/10 hover:bg-white/5"
                      >
                        <TableCell className="text-white font-mono text-sm">
                          {product.code}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-white font-medium">{product.name}</p>
                            {product.description && (
                              <p className="text-gray-400 text-sm truncate max-w-xs">
                                {product.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {product.type}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {product.unit}
                        </TableCell>
                        <TableCell className="text-white font-medium">
                          {editingPrice?.id === product.id ? (
                            <div className="flex min-w-48 items-center gap-2">
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={editingPrice.value}
                                onChange={(event) =>
                                  setEditingPrice({
                                    id: product.id,
                                    value: event.target.value,
                                  })
                                }
                                className="h-8 bg-white/5 border-white/10 text-white"
                                autoFocus
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePriceSave(product)}
                                disabled={updateProduct.isPending}
                                className="h-8 w-8 p-0 text-green-400 hover:bg-green-500/10 hover:text-green-300"
                                title="Save price"
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingPrice(null)}
                                className="h-8 w-8 p-0 text-gray-400 hover:bg-white/10 hover:text-white"
                                title="Cancel price edit"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                setEditingPrice({
                                  id: product.id,
                                  value: String(product.defaultPrice),
                                })
                              }
                              className="rounded-md px-2 py-1 text-left text-white hover:bg-white/10"
                              title="Quick edit price"
                            >
                              {formatCurrency(product.defaultPrice)}
                            </button>
                          )}
                        </TableCell>
                        <TableCell>
                          {product.vatApplicable ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-500" />
                          )}
                        </TableCell>
                        <TableCell>
                          {product.isActive ? (
                            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                              Active
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                router.push(`/dashboard/products/${product.id}/edit`)
                              }
                              className="text-brand-yellow-500 hover:text-brand-yellow-400 hover:bg-brand-yellow-500/10"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDuplicate(product)}
                              disabled={createProduct.isPending}
                              className="text-blue-300 hover:text-blue-200 hover:bg-blue-500/10"
                              title="Duplicate product"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            {product.isActive ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setArchiveTarget({
                                    id: product.id,
                                    name: product.name,
                                    isActive: product.isActive,
                                  })
                                }
                                className="text-gray-400 hover:text-white hover:bg-white/10"
                                title="Archive product"
                              >
                                <Archive className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReactivate(product)}
                                disabled={updateProduct.isPending}
                                className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                                title="Reactivate product"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
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
                    {Math.min(page * limit, totalCount)} of {totalCount} products
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
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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

      <AlertDialog
        open={!!archiveTarget}
        onOpenChange={(open) => {
          if (!open) setArchiveTarget(null);
        }}
      >
        <AlertDialogContent className="bg-gray-900 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              {archiveTarget?.isActive ? "Archive Product?" : "Reactivate Product?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              {archiveTarget?.isActive
                ? `${archiveTarget.name} will be hidden from active product pickers but kept in your catalog history.`
                : `${archiveTarget?.name || "This product"} will return to active product pickers.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/20 text-white hover:bg-white/5">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleArchiveToggle}
              className={
                archiveTarget?.isActive
                  ? "bg-brand-yellow-500 text-black hover:bg-brand-yellow-600"
                  : "bg-green-600 text-white hover:bg-green-700"
              }
              disabled={updateProduct.isPending}
            >
              {updateProduct.isPending
                ? "Saving..."
                : archiveTarget?.isActive
                  ? "Archive"
                  : "Reactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

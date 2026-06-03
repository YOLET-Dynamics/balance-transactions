"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Truck } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useVendorLedger } from "@/lib/hooks/use-vendors";

function formatCurrency(amount: number): string {
  return `ETB ${new Intl.NumberFormat("en-ET", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
}

function formatDate(value: string): string {
  return format(new Date(value), "MMM dd, yyyy");
}

export default function VendorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading, error } = useVendorLedger(id);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <Loader2 className="h-10 w-10 animate-spin text-brand-yellow-500" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="space-y-4 text-center">
          <Truck className="mx-auto h-12 w-12 text-gray-600" />
          <p className="text-white">Vendor not found</p>
          <Button
            onClick={() => router.push("/dashboard/vendors")}
            className="bg-brand-yellow-500 text-black hover:bg-brand-yellow-600"
          >
            Back to vendors
          </Button>
        </div>
      </div>
    );
  }

  const vendorName =
    data.vendor.legalName || data.vendor.tradeName || "Unnamed vendor";

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="break-words text-2xl font-bold text-white sm:text-3xl">
                {vendorName}
              </h1>
              <Badge className="border-white/10 bg-white/5 text-gray-300">
                {data.vendor.type}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-gray-400">
              {data.vendor.tin ? `TIN ${data.vendor.tin}` : "No TIN saved"}
            </p>
          </div>
        </div>
        <Button
          asChild
          className="bg-brand-yellow-500 font-semibold text-black hover:bg-brand-yellow-600"
        >
          <Link href="/dashboard/purchases/new">New purchase</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-white/10 bg-white/5">
          <CardContent className="p-4">
            <p className="text-sm text-gray-400">Outstanding</p>
            <p className="mt-2 text-xl font-bold text-white">
              {formatCurrency(data.summary.outstanding)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/5">
          <CardContent className="p-4">
            <p className="text-sm text-gray-400">Old open bills</p>
            <p className="mt-2 text-xl font-bold text-red-300">
              {formatCurrency(data.summary.oldOpen)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/5">
          <CardContent className="p-4">
            <p className="text-sm text-gray-400">Total billed</p>
            <p className="mt-2 text-xl font-bold text-white">
              {formatCurrency(data.summary.totalBilled)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/5">
          <CardContent className="p-4">
            <p className="text-sm text-gray-400">Paid</p>
            <p className="mt-2 text-xl font-bold text-green-300">
              {formatCurrency(data.summary.totalPaid)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-white/10 bg-white/5 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-white">Contact & Tax</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="text-gray-400">Trade name</p>
              <p className="text-white">{data.vendor.tradeName || "—"}</p>
            </div>
            <div>
              <p className="text-gray-400">Phone</p>
              <p className="text-white">{data.vendor.phone || "—"}</p>
            </div>
            <div>
              <p className="text-gray-400">Email</p>
              <p className="text-white">{data.vendor.email || "—"}</p>
            </div>
            <div>
              <p className="text-gray-400">VAT number</p>
              <p className="font-mono text-white">
                {data.vendor.vatNumber || "—"}
              </p>
            </div>
            <div>
              <p className="text-gray-400">Address</p>
              <p className="text-white">
                {[
                  data.vendor.subcity,
                  data.vendor.cityRegion,
                  data.vendor.country,
                ]
                  .filter(Boolean)
                  .join(", ") || "—"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white">Ledger</CardTitle>
          </CardHeader>
          <CardContent>
            {data.entries.length === 0 ? (
              <p className="py-12 text-center text-sm text-gray-400">
                No matched purchase bills or payments for this vendor.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-gray-300">Date</TableHead>
                      <TableHead className="text-gray-300">Document</TableHead>
                      <TableHead className="text-right text-gray-300">
                        Amount
                      </TableHead>
                      <TableHead className="text-right text-gray-300">
                        Balance
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.entries.map((entry) => (
                      <TableRow
                        key={`${entry.type}-${entry.id}`}
                        className="border-white/10 hover:bg-white/5"
                      >
                        <TableCell className="whitespace-nowrap text-gray-300">
                          {formatDate(entry.date)}
                        </TableCell>
                        <TableCell>
                          <Link href={entry.href} className="block">
                            <p className="font-medium text-white">
                              {entry.documentNumber}
                            </p>
                            <p className="max-w-sm truncate text-sm text-gray-400">
                              {entry.label} · {entry.status}
                              {entry.daysOpen !== null
                                ? ` · ${entry.daysOpen} days open`
                                : ""}
                            </p>
                          </Link>
                        </TableCell>
                        <TableCell
                          className={
                            entry.amount < 0
                              ? "text-right font-medium text-green-300"
                              : "text-right font-medium text-white"
                          }
                        >
                          {formatCurrency(Math.abs(entry.amount))}
                        </TableCell>
                        <TableCell className="text-right font-medium text-white">
                          {entry.type === "bill"
                            ? formatCurrency(entry.balance)
                            : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

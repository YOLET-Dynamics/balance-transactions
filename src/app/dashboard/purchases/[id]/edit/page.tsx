"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PurchaseBillForm } from "@/components/forms/purchase-bill-form";
import {
  usePurchaseBill,
  useUpdatePurchaseBill,
} from "@/lib/hooks/use-purchases";

export default function EditPurchaseBillPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: bill, isLoading, error } = usePurchaseBill(id);
  const updateBill = useUpdatePurchaseBill();

  const handleSubmit = (data: any) => {
    updateBill.mutate(
      { id, data },
      {
        onSuccess: () => {
          router.push(`/dashboard/purchases/${id}`);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-brand-yellow-500 mx-auto" />
          <p className="text-gray-400">Loading purchase bill...</p>
        </div>
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <p className="text-gray-400">Purchase bill not found</p>
          <Button
            onClick={() => router.push("/dashboard/purchases")}
            className="bg-brand-yellow-500 text-black hover:bg-brand-yellow-600"
          >
            Back to Purchase Bills
          </Button>
        </div>
      </div>
    );
  }

  const initialData = {
    vendorLegalName: bill.vendorLegalName || "",
    vendorTradeName: bill.vendorTradeName || undefined,
    vendorSubcity: bill.vendorSubcity || undefined,
    vendorCityRegion: bill.vendorCityRegion || undefined,
    vendorCountry: bill.vendorCountry || "ET",
    vendorTin: bill.vendorTin || undefined,
    vendorVatNumber: bill.vendorVatNumber || undefined,
    vendorPhone: bill.vendorPhone || undefined,
    reason: bill.reason,
    paymentMethod: bill.paymentMethod as any,
    paymentRef: bill.paymentRef || undefined,
    createdBy: bill.createdBy || undefined,
    reviewedBy: bill.reviewedBy || undefined,
    authorizedBy: bill.authorizedBy || undefined,
    lines:
      bill.lines?.map((line) => ({
        description: line.description,
        unit: line.unit,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        discountAmount: line.discountAmount || 0,
        isVatApplicable: line.isVatApplicable,
        itemId: line.itemId || undefined,
      })) || [],
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-white">Edit Purchase Bill</h1>
          <p className="text-gray-400 mt-1">{bill.number}</p>
        </div>
      </div>

      {/* Form */}
      <PurchaseBillForm
        initialData={initialData}
        onSubmit={handleSubmit}
        isLoading={updateBill.isPending}
        mode="edit"
      />
    </div>
  );
}

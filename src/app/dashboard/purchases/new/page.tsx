"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PurchaseBillForm } from "@/components/forms/purchase-bill-form";
import { useCreatePurchaseBill } from "@/lib/hooks/use-purchases";

export default function NewPurchaseBillPage() {
  const router = useRouter();
  const createBill = useCreatePurchaseBill();

  const handleSubmit = (data: any) => {
    createBill.mutate(data, {
      onSuccess: (newBill: any) => {
        router.push(`/dashboard/purchases/${newBill.id}`);
      },
    });
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
          <h1 className="text-3xl font-bold text-white">New Purchase Bill</h1>
          <p className="text-gray-400 mt-1">
            Create a new purchase bill record
          </p>
        </div>
      </div>

      {/* Form */}
      <PurchaseBillForm
        onSubmit={handleSubmit}
        isLoading={createBill.isPending}
        mode="create"
      />
    </div>
  );
}

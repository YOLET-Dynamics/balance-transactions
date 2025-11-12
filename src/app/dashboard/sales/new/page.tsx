"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InvoiceForm } from "@/components/forms/invoice-form";
import { useCreateInvoice } from "@/lib/hooks/use-sales";

export default function NewInvoicePage() {
  const router = useRouter();
  const createInvoice = useCreateInvoice();

  const handleSubmit = (data: any) => {
    createInvoice.mutate(data, {
      onSuccess: () => {
        router.push("/dashboard/sales");
      },
    });
  };

  const handleSaveDraft = (data: any) => {
    createInvoice.mutate(
      { ...data, status: "Draft" },
      {
        onSuccess: () => {
          router.push("/dashboard/sales");
        },
      }
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
            <h1 className="text-3xl font-bold text-white">
              Create New Invoice
            </h1>
            <p className="text-gray-400 mt-1">
              Fill in the details to create a sales invoice
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <InvoiceForm
        onSubmit={handleSubmit}
        onSaveDraft={handleSaveDraft}
        isLoading={createInvoice.isPending}
        mode="create"
      />
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InvoiceForm } from "@/components/forms/invoice-form";
import { useCreateProforma } from "@/lib/hooks/use-proforma";

export default function NewProformaPage() {
  const router = useRouter();
  const createProforma = useCreateProforma();

  const handleSubmit = (data: any) => {
    createProforma.mutate(data, {
      onSuccess: () => {
        router.push("/dashboard/proforma");
      },
    });
  };

  const handleSaveDraft = (data: any) => {
    createProforma.mutate(
      { ...data, status: "Draft" },
      {
        onSuccess: () => {
          router.push("/dashboard/proforma");
        },
      }
    );
  };

  return (
    <div className="p-6 space-y-6">
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
              Create New Proforma Invoice
            </h1>
            <p className="text-gray-400 mt-1">
              Fill in the details to create a quotation or estimate
            </p>
          </div>
        </div>
      </div>

      <InvoiceForm
        onSubmit={handleSubmit}
        onSaveDraft={handleSaveDraft}
        isLoading={createProforma.isPending}
        mode="create"
        documentKind="proforma"
      />
    </div>
  );
}

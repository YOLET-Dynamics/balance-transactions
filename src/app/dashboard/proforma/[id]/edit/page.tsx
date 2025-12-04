"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InvoiceForm } from "@/components/forms/invoice-form";
import { useProformaInvoice, useUpdateProforma } from "@/lib/hooks/use-proforma";

export default function EditProformaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: proforma, isLoading } = useProformaInvoice(id);
  const updateProforma = useUpdateProforma();

  const handleSubmit = (data: any) => {
    updateProforma.mutate(
      { id, data },
      {
        onSuccess: () => {
          router.push(`/dashboard/proforma/${id}`);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-brand-yellow-500 mx-auto" />
          <p className="text-gray-400">Loading proforma invoice...</p>
        </div>
      </div>
    );
  }

  if (!proforma) {
    return (
      <div className="p-6">
        <p className="text-red-400">Proforma invoice not found</p>
      </div>
    );
  }

  if (proforma.status !== "Draft") {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <p className="text-gray-300">Only draft proforma invoices can be edited</p>
          <Button
            onClick={() => router.push(`/dashboard/proforma/${id}`)}
            className="bg-brand-yellow-500 text-black hover:bg-brand-yellow-600"
          >
            View Proforma
          </Button>
        </div>
      </div>
    );
  }

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
              Edit Proforma {proforma.number}
            </h1>
            <p className="text-gray-400 mt-1">
              Update the proforma invoice details
            </p>
          </div>
        </div>
      </div>

      <InvoiceForm
        initialData={proforma as any}
        onSubmit={handleSubmit}
        isLoading={updateProforma.isPending}
        mode="edit"
      />
    </div>
  );
}


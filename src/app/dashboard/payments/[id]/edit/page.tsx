"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaymentForm } from "@/components/forms/payment-form";
import { usePayment, useUpdatePayment } from "@/lib/hooks/use-payments";

export default function EditPaymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading, error } = usePayment(id);
  const updatePayment = useUpdatePayment();

  const payment = data as any;

  const handleSubmit = (formData: any) => {
    updatePayment.mutate(
      { id, data: formData },
      {
        onSuccess: () => {
          router.push(`/dashboard/payments/${id}`);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-brand-yellow-500 mx-auto" />
          <p className="text-gray-400">Loading payment...</p>
        </div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <p className="text-red-400">Failed to load payment</p>
          <Button
            onClick={() => router.back()}
            className="bg-brand-yellow-500 text-black hover:bg-brand-yellow-600"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-white">Edit Payment Voucher</h1>
          <p className="text-gray-400 mt-1">Update payment details</p>
        </div>
      </div>

      {/* Form */}
      <PaymentForm
        initialData={payment}
        onSubmit={handleSubmit}
        isLoading={updatePayment.isPending}
        mode="edit"
      />
    </div>
  );
}


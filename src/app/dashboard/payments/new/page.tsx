"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaymentForm } from "@/components/forms/payment-form";
import { useCreatePayment } from "@/lib/hooks/use-payments";

export default function NewPaymentPage() {
  const router = useRouter();
  const createPayment = useCreatePayment();

  const handleSubmit = (data: any) => {
    createPayment.mutate(data, {
      onSuccess: (newPayment: any) => {
        router.push(`/dashboard/payments/${newPayment.id}`);
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
          <h1 className="text-3xl font-bold text-white">New Payment Voucher</h1>
          <p className="text-gray-400 mt-1">
            Record a new payment transaction
          </p>
        </div>
      </div>

      {/* Form */}
      <PaymentForm
        onSubmit={handleSubmit}
        isLoading={createPayment.isPending}
        mode="create"
      />
    </div>
  );
}


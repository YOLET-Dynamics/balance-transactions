"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createPaymentSchema,
  PaymentDirectionEnum,
  PaymentMethodEnum,
  RelatedTypeEnum,
} from "@/lib/validation/schemas";
import { useSession } from "@/lib/hooks/use-session";
import { useEffect } from "react";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";

type PaymentFormData = z.infer<typeof createPaymentSchema>;

interface PaymentFormProps {
  initialData?: Partial<PaymentFormData>;
  onSubmit: (data: PaymentFormData) => void;
  isLoading?: boolean;
  mode?: "create" | "edit";
}

export function PaymentForm({
  initialData,
  onSubmit,
  isLoading = false,
  mode = "create",
}: PaymentFormProps) {
  const { data: session } = useSession();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(createPaymentSchema),
    defaultValues: initialData || {
      direction: "Outgoing",
      method: "Cash",
      amount: 0,
      relatedType: "None",
      relatedId: undefined,
      createdBy: "",
      reviewedBy: "",
      authorizedBy: "",
    },
  });

  const direction = watch("direction");
  const relatedType = watch("relatedType");

  useEffect(() => {
    if (mode === "create" && session?.user && !initialData?.createdBy) {
      const userName =
        `${session.user.firstName || ""} ${session.user.lastName || ""}`.trim();
      if (userName) {
        setValue("createdBy", userName);
      }
    }
  }, [session, mode, initialData, setValue]);

  const handleFormSubmit = (data: PaymentFormData) => {
    // Clean up the data before submitting
    const cleanData = {
      ...data,
      amount: Number(data.amount),
      relatedId: data.relatedType === "None" ? undefined : data.relatedId,
    };
    onSubmit(cleanData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Direction */}
              <div className="space-y-2">
                <Label className="text-gray-300">Direction *</Label>
                <Select
                  value={direction}
                  onValueChange={(value) =>
                    setValue("direction", value as any)
                  }
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Incoming">
                      <div className="flex items-center gap-2">
                        <ArrowDownCircle className="h-4 w-4 text-green-500" />
                        <span>Incoming (Received)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Outgoing">
                      <div className="flex items-center gap-2">
                        <ArrowUpCircle className="h-4 w-4 text-red-500" />
                        <span>Outgoing (Paid)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.direction && (
                  <p className="text-red-400 text-sm">
                    {errors.direction.message}
                  </p>
                )}
              </div>

              {/* Amount */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-gray-300">
                    Amount *
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register("amount", { valueAsNumber: true })}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="0.00"
                  />
                  {errors.amount && (
                    <p className="text-red-400 text-sm">{errors.amount.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Currency</Label>
                  <Input
                    value="ETB"
                    disabled
                    className="bg-white/5 border-white/10 text-gray-400"
                  />
                  <p className="text-gray-500 text-sm">Ethiopian Birr</p>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label className="text-gray-300">Payment Method *</Label>
                <Select
                  {...register("method")}
                  onValueChange={(value) => setValue("method", value as any)}
                  defaultValue={initialData?.method || "Cash"}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PaymentMethodEnum.options.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method === "BankTransfer"
                          ? "Bank Transfer"
                          : method === "POS"
                          ? "POS"
                          : method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.method && (
                  <p className="text-red-400 text-sm">{errors.method.message}</p>
                )}
              </div>

              {/* Related Type */}
              <div className="space-y-2">
                <Label className="text-gray-300">Related To *</Label>
                <Select
                  value={relatedType}
                  onValueChange={(value) =>
                    setValue("relatedType", value as any)
                  }
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">Standalone Payment</SelectItem>
                    <SelectItem value="Invoice">Sales Invoice</SelectItem>
                    <SelectItem value="Bill">Purchase Bill</SelectItem>
                  </SelectContent>
                </Select>
                {errors.relatedType && (
                  <p className="text-red-400 text-sm">
                    {errors.relatedType.message}
                  </p>
                )}
              </div>

              {/* Related ID (only if not None) */}
              {relatedType !== "None" && (
                <div className="space-y-2">
                  <Label htmlFor="relatedId" className="text-gray-300">
                    {relatedType === "Invoice" ? "Invoice" : "Bill"} ID
                  </Label>
                  <Input
                    id="relatedId"
                    {...register("relatedId")}
                    className="bg-white/5 border-white/10 text-white font-mono"
                    placeholder="Enter the related document ID"
                  />
                  {errors.relatedId && (
                    <p className="text-red-400 text-sm">
                      {errors.relatedId.message}
                    </p>
                  )}
                  <p className="text-gray-500 text-sm">
                    Optional: Link this payment to a specific{" "}
                    {relatedType === "Invoice" ? "invoice" : "bill"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Personnel Info */}
        <div className="space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Personnel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="createdBy" className="text-gray-300">
                  Created By
                </Label>
                <Input
                  id="createdBy"
                  {...register("createdBy")}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="Your name"
                />
                {errors.createdBy && (
                  <p className="text-red-400 text-sm">
                    {errors.createdBy.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reviewedBy" className="text-gray-300">
                  Reviewed By
                </Label>
                <Input
                  id="reviewedBy"
                  {...register("reviewedBy")}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="Optional"
                />
                {errors.reviewedBy && (
                  <p className="text-red-400 text-sm">
                    {errors.reviewedBy.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="authorizedBy" className="text-gray-300">
                  Authorized By
                </Label>
                <Input
                  id="authorizedBy"
                  {...register("authorizedBy")}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="Optional"
                />
                {errors.authorizedBy && (
                  <p className="text-red-400 text-sm">
                    {errors.authorizedBy.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card className="bg-gradient-to-br from-brand-yellow-500/10 to-transparent border-brand-yellow-500/20">
            <CardContent className="p-4 space-y-3">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand-yellow-500 text-black hover:bg-brand-yellow-600 font-semibold"
              >
                {isLoading
                  ? mode === "create"
                    ? "Creating..."
                    : "Updating..."
                  : mode === "create"
                  ? "Create Payment"
                  : "Update Payment"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}


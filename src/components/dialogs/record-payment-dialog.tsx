"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { PaymentMethodEnum } from "@/lib/validation/schemas";
import { useSession } from "@/lib/hooks/use-session";
import { Loader2 } from "lucide-react";

const recordPaymentSchema = z.object({
  method: z.string(),
  amount: z.number().positive(),
  createdBy: z.string().optional(),
  reviewedBy: z.string().optional(),
  authorizedBy: z.string().optional(),
});

type RecordPaymentFormData = z.infer<typeof recordPaymentSchema>;

interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: RecordPaymentFormData) => void;
  isLoading?: boolean;
  direction: "Incoming" | "Outgoing";
  defaultAmount: number;
  documentType: "Invoice" | "Bill";
  documentNumber: string;
}

export function RecordPaymentDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
  direction,
  defaultAmount,
  documentType,
  documentNumber,
}: RecordPaymentDialogProps) {
  const { data: session } = useSession();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<RecordPaymentFormData>({
    resolver: zodResolver(recordPaymentSchema),
    defaultValues: {
      method: "Cash",
      amount: defaultAmount,
      createdBy: "",
      reviewedBy: "",
      authorizedBy: "",
    },
  });

  const method = watch("method");

  useEffect(() => {
    if (open && session?.user) {
      const userName =
        `${session.user.firstName || ""} ${session.user.lastName || ""}`.trim();
      if (userName) {
        setValue("createdBy", userName);
      }
      setValue("amount", defaultAmount);
    }
  }, [open, session, setValue, defaultAmount]);

  const handleFormSubmit = (data: RecordPaymentFormData) => {
    onSubmit(data);
    reset();
  };

  const handleCancel = () => {
    onOpenChange(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-white/10 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">
            Record Payment - {documentNumber}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Record a {direction === "Incoming" ? "received" : "paid"} payment for
            this {documentType.toLowerCase()}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-gray-300">
              Amount (ETB) *
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              {...register("amount", { valueAsNumber: true })}
              className="bg-white/5 border-white/10 text-white"
            />
            {errors.amount && (
              <p className="text-red-400 text-sm">{errors.amount.message}</p>
            )}
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label className="text-gray-300">Payment Method *</Label>
            <Select value={method} onValueChange={(value) => setValue("method", value)}>
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

          {/* Created By */}
          <div className="space-y-2">
            <Label htmlFor="createdBy" className="text-gray-300">
              Recorded By
            </Label>
            <Input
              id="createdBy"
              {...register("createdBy")}
              className="bg-white/5 border-white/10 text-white"
              placeholder="Your name"
            />
            {errors.createdBy && (
              <p className="text-red-400 text-sm">{errors.createdBy.message}</p>
            )}
          </div>

          {/* Reviewed By */}
          <div className="space-y-2">
            <Label htmlFor="reviewedBy" className="text-gray-300">
              Reviewed By (Optional)
            </Label>
            <Input
              id="reviewedBy"
              {...register("reviewedBy")}
              className="bg-white/5 border-white/10 text-white"
              placeholder="Reviewer name"
            />
          </div>

          {/* Authorized By */}
          <div className="space-y-2">
            <Label htmlFor="authorizedBy" className="text-gray-300">
              Authorized By (Optional)
            </Label>
            <Input
              id="authorizedBy"
              {...register("authorizedBy")}
              className="bg-white/5 border-white/10 text-white"
              placeholder="Authorizer name"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1 border-white/20 text-white hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-brand-yellow-500 text-black hover:bg-brand-yellow-600 font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Recording...
                </>
              ) : (
                "Record Payment"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}


"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Loader2,
  FileText,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { usePayment, useDeletePayment } from "@/lib/hooks/use-payments";
import { useSession } from "@/lib/hooks/use-session";
import { formatDistanceToNow } from "date-fns";

export default function PaymentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading, error } = usePayment(id);
  const { data: session } = useSession();
  const deletePayment = useDeletePayment();
  
  const payment = data as any;

  const formatCurrency = (amount: number) => {
    return `ETB ${new Intl.NumberFormat("en-ET", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)}`;
  };

  const getDirectionBadge = (direction: string) => {
    if (direction === "Incoming") {
      return (
        <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-lg py-1 px-3">
          <ArrowDownCircle className="h-5 w-5 mr-2" />
          Incoming
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-lg py-1 px-3">
        <ArrowUpCircle className="h-5 w-5 mr-2" />
        Outgoing
      </Badge>
    );
  };

  const canEdit = () => {
    if (!session?.membership) return false;
    const role = session.membership.role;
    return ["Owner", "Admin", "Manager"].includes(role);
  };

  const canDelete = () => {
    if (!session?.membership) return false;
    const role = session.membership.role;
    return ["Owner", "Admin"].includes(role);
  };

  const handleDelete = () => {
    deletePayment.mutate(id, {
      onSuccess: () => {
        router.push("/dashboard/payments");
      },
    });
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
          <FileText className="h-16 w-16 text-gray-600 mx-auto" />
          <div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              Payment not found
            </h3>
            <p className="text-gray-400">
              The payment you're looking for doesn't exist or has been deleted.
            </p>
          </div>
          <Button
            onClick={() => router.push("/dashboard/payments")}
            className="bg-brand-yellow-500 text-black hover:bg-brand-yellow-600"
          >
            Back to Payments
          </Button>
        </div>
      </div>
    );
  }

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
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white">Payment Voucher</h1>
              {getDirectionBadge(payment.direction)}
            </div>
            <p className="text-gray-400 mt-1">
              Created{" "}
              {payment.createdAt
                ? formatDistanceToNow(new Date(payment.createdAt), {
                    addSuffix: true,
                  })
                : "Unknown"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canEdit() && (
            <Button
              onClick={() => router.push(`/dashboard/payments/${id}/edit`)}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/5"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}

          {canDelete() && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-gray-900 border-white/10">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">
                    Delete Payment?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-400">
                    This action cannot be undone. This will permanently delete
                    the payment and remove it from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-white/20 text-white hover:bg-white/5">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700 text-white"
                    disabled={deletePayment.isPending}
                  >
                    {deletePayment.isPending ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Details */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Amount</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(payment.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Currency</p>
                  <p className="text-white font-medium text-xl">
                    {payment.currency}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-400">Payment Method</p>
                <p className="text-white font-medium">{payment.method}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Related Type</p>
                <p className="text-white font-medium">
                  {payment.relatedType === "None"
                    ? "Standalone Payment"
                    : payment.relatedType}
                </p>
              </div>
              {payment.relatedId && (
                <div>
                  <p className="text-sm text-gray-400">
                    {payment.relatedType === "Invoice" ? "Invoice ID" : "Bill ID"}
                  </p>
                  <button
                    onClick={() =>
                      router.push(
                        payment.relatedType === "Invoice"
                          ? `/dashboard/sales/${payment.relatedId}`
                          : `/dashboard/purchases/${payment.relatedId}`
                      )
                    }
                    className="text-brand-yellow-500 hover:text-brand-yellow-400 font-mono text-sm underline"
                  >
                    {payment.relatedId}
                  </button>
                  <p className="text-gray-500 text-xs mt-1">
                    Click to view {payment.relatedType.toLowerCase()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Personnel Info */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Personnel Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {payment.createdBy && (
                <div>
                  <p className="text-gray-400">Created By</p>
                  <p className="text-white font-medium">{payment.createdBy}</p>
                </div>
              )}
              {payment.reviewedBy && (
                <div>
                  <p className="text-gray-400">Reviewed By</p>
                  <p className="text-white font-medium">{payment.reviewedBy}</p>
                </div>
              )}
              {payment.authorizedBy && (
                <div>
                  <p className="text-gray-400">Authorized By</p>
                  <p className="text-white font-medium">
                    {payment.authorizedBy}
                  </p>
                </div>
              )}
              {!payment.createdBy &&
                !payment.reviewedBy &&
                !payment.authorizedBy && (
                  <p className="text-gray-500 text-sm">
                    No personnel information recorded
                  </p>
                )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Summary Card */}
          <Card className="bg-gradient-to-br from-brand-yellow-500/10 to-transparent border-brand-yellow-500/20">
            <CardHeader>
              <CardTitle className="text-white">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Direction:</span>
                <span className="text-white font-medium">
                  {payment.direction}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-white/10">
                <span className="text-white font-medium">Total Amount:</span>
                <span className="text-white font-bold text-xl">
                  {formatCurrency(payment.amount)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Transaction Details Card */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Transaction Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-gray-400">Created</p>
                <p className="text-white">
                  {payment.createdAt
                    ? formatDistanceToNow(new Date(payment.createdAt), {
                        addSuffix: true,
                      })
                    : "Unknown"}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Payment ID</p>
                <p className="text-white font-mono text-xs break-all">
                  {payment.id}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

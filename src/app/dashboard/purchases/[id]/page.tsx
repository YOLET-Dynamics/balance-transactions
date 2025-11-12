"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Loader2,
  FileText,
  Download,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  usePurchaseBill,
  useDeletePurchaseBill,
  useUpdatePurchaseBill,
} from "@/lib/hooks/use-purchases";
import { useSession } from "@/lib/hooks/use-session";
import { formatDistanceToNow } from "date-fns";
import { axiosInstance } from "@/lib/api/client";
import { toast } from "sonner";

export default function PurchaseBillDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: bill, isLoading, error } = usePurchaseBill(id);
  const { data: session } = useSession();
  const deleteBill = useDeletePurchaseBill();
  const updateBill = useUpdatePurchaseBill();
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  const formatCurrency = (amount: number) => {
    return `ETB ${new Intl.NumberFormat("en-ET", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Draft":
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
      case "Pending":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "Paid":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "Cancelled":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
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

  const canApprove = () => {
    if (!session?.membership) return false;
    const role = session.membership.role;
    return (
      ["Owner", "Admin", "Manager"].includes(role) && bill?.status === "Pending"
    );
  };

  const handleDelete = () => {
    deleteBill.mutate(id, {
      onSuccess: () => {
        router.push("/dashboard/purchases");
      },
    });
  };

  const handleStatusChange = (newStatus: string) => {
    updateBill.mutate(
      { id, data: { status: newStatus } },
      {
        onSuccess: () => {
          toast.success(`Bill status updated to ${newStatus}`);
        },
      }
    );
  };

  const handlePreviewPdf = async () => {
    try {
      const response = await axiosInstance.get(`/api/purchases/${id}/pdf`, {
        responseType: "blob",
        withCredentials: true,
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setPdfBlobUrl(url);
      setShowPdfPreview(true);
    } catch (error) {
      console.error("Failed to preview PDF:", error);
      toast.error("Failed to preview PDF");
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const response = await axiosInstance.get(`/api/purchases/${id}/pdf`, {
        responseType: "blob",
        withCredentials: true,
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `purchase-bill-${bill?.number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error("Failed to download PDF:", error);
      toast.error("Failed to download PDF");
    }
  };

  const handleClosePreview = () => {
    if (pdfBlobUrl) {
      URL.revokeObjectURL(pdfBlobUrl);
      setPdfBlobUrl(null);
    }
    setShowPdfPreview(false);
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
          <FileText className="h-16 w-16 text-gray-600 mx-auto" />
          <div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              Purchase bill not found
            </h3>
            <p className="text-gray-400">
              The purchase bill you're looking for doesn't exist or has been
              deleted.
            </p>
          </div>
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
              <h1 className="text-3xl font-bold text-white">{bill.number}</h1>
              <Badge className={getStatusColor(bill.status)}>
                {bill.status}
              </Badge>
            </div>
            <p className="text-gray-400 mt-1">
              Created{" "}
              {bill.createdAt
                ? formatDistanceToNow(new Date(bill.createdAt), {
                    addSuffix: true,
                  })
                : "Unknown"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handlePreviewPdf}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/5"
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview PDF
          </Button>

          <Button
            onClick={handleDownloadPdf}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/5"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>

          {canApprove() && (
            <Button
              onClick={() => handleStatusChange("Paid")}
              disabled={updateBill.isPending}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              Mark as Paid
            </Button>
          )}

          {canEdit() && (
            <Button
              onClick={() => router.push(`/dashboard/purchases/${id}/edit`)}
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
                    Delete Purchase Bill?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-400">
                    This action cannot be undone. This will permanently delete
                    the purchase bill and remove it from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-white/20 text-white hover:bg-white/5">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700 text-white"
                    disabled={deleteBill.isPending}
                  >
                    {deleteBill.isPending ? "Deleting..." : "Delete"}
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
          {/* Vendor Information */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Vendor Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-400">Legal Name</p>
                <p className="text-white font-medium">
                  {bill.vendorLegalName || "N/A"}
                </p>
              </div>
              {bill.vendorTradeName && (
                <div>
                  <p className="text-sm text-gray-400">Trade Name</p>
                  <p className="text-white">{bill.vendorTradeName}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                {bill.vendorTin && (
                  <div>
                    <p className="text-sm text-gray-400">TIN</p>
                    <p className="text-white">{bill.vendorTin}</p>
                  </div>
                )}
                {bill.vendorVatNumber && (
                  <div>
                    <p className="text-sm text-gray-400">VAT Number</p>
                    <p className="text-white">{bill.vendorVatNumber}</p>
                  </div>
                )}
              </div>
              {bill.vendorPhone && (
                <div>
                  <p className="text-sm text-gray-400">Phone</p>
                  <p className="text-white">{bill.vendorPhone}</p>
                </div>
              )}
              {(bill.vendorSubcity ||
                bill.vendorCityRegion ||
                bill.vendorCountry) && (
                <div>
                  <p className="text-sm text-gray-400">Address</p>
                  <p className="text-white">
                    {[
                      bill.vendorSubcity,
                      bill.vendorCityRegion,
                      bill.vendorCountry,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bill.lines?.map((line) => (
                  <div
                    key={line.id}
                    className="flex items-start justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="flex-1">
                      <p className="text-white font-medium">
                        {line.description}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        {line.quantity} {line.unit} ×{" "}
                        {formatCurrency(line.unitPrice)}
                        {line.discountAmount && line.discountAmount > 0 && (
                          <span className="text-green-400">
                            {" "}
                            - {formatCurrency(line.discountAmount)} discount
                          </span>
                        )}
                      </p>
                    </div>
                    <p className="text-white font-semibold">
                      {formatCurrency(line.lineTotal)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reason */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Purchase Reason</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">{bill.reason}</p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Summary */}
          <Card className="bg-gradient-to-br from-brand-yellow-500/10 to-transparent border-brand-yellow-500/20">
            <CardHeader>
              <CardTitle className="text-white">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Subtotal:</span>
                <span className="text-white font-medium">
                  {formatCurrency(Number(bill.subtotal))}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">VAT (15%):</span>
                <span className="text-white font-medium">
                  {formatCurrency(Number(bill.vatAmount))}
                </span>
              </div>
              <div className="flex justify-between text-sm border-t border-white/10 pt-3">
                <span className="text-white font-medium">Total:</span>
                <span className="text-white font-bold text-xl">
                  {formatCurrency(Number(bill.total))}
                </span>
              </div>
              {bill.withheldAmount && bill.withheldAmount > 0 && (
                <>
                  <div className="flex justify-between text-sm text-red-400">
                    <span>Withholding Tax ({bill.withheldPct}%):</span>
                    <span className="font-medium">
                      -{formatCurrency(Number(bill.withheldAmount))}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-3">
                    <span className="text-brand-yellow-500 font-medium">
                      Net Paid:
                    </span>
                    <span className="text-brand-yellow-500 font-bold text-xl">
                      {formatCurrency(Number(bill.netPaid))}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-400">Payment Method</p>
                <p className="text-white font-medium">{bill.paymentMethod}</p>
              </div>
              {bill.paymentRef && (
                <div>
                  <p className="text-sm text-gray-400">Reference</p>
                  <p className="text-white">{bill.paymentRef}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Info */}
          {(bill.createdBy || bill.reviewedBy || bill.authorizedBy) && (
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Additional Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {bill.createdBy && (
                  <div>
                    <p className="text-sm text-gray-400">Created By</p>
                    <p className="text-white">{bill.createdBy}</p>
                  </div>
                )}
                {bill.reviewedBy && (
                  <div>
                    <p className="text-sm text-gray-400">Reviewed By</p>
                    <p className="text-white">{bill.reviewedBy}</p>
                  </div>
                )}
                {bill.authorizedBy && (
                  <div>
                    <p className="text-sm text-gray-400">Authorized By</p>
                    <p className="text-white">{bill.authorizedBy}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* PDF Preview Dialog */}
      <Dialog open={showPdfPreview} onOpenChange={handleClosePreview}>
        <DialogContent className="bg-gray-900 border-white/10 max-w-6xl h-[90vh] p-0 flex flex-col gap-0">
          <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4">
            <DialogTitle className="text-white">
              Purchase Bill Preview - {bill?.number}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 px-6 pb-6" style={{ minHeight: 0 }}>
            {pdfBlobUrl ? (
              <iframe
                src={pdfBlobUrl}
                className="w-full h-full rounded-lg border border-white/10"
                title="Purchase Bill PDF Preview"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-brand-yellow-500" />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

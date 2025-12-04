"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Download,
  X,
  Loader2,
  FileText,
  Eye,
} from "lucide-react";
import { axiosInstance } from "@/lib/api/client";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useProformaInvoice,
  useDeleteProforma,
  useUpdateProforma,
} from "@/lib/hooks/use-proforma";
import { useSession } from "@/lib/hooks/use-session";
import { formatDistanceToNow, format } from "date-fns";

export default function ProformaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: proforma, isLoading, error } = useProformaInvoice(id);
  const { data: session } = useSession();
  const deleteProforma = useDeleteProforma();
  const updateProforma = useUpdateProforma();
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return `ETB ${new Intl.NumberFormat("en-ET", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)}`;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      Draft: "bg-gray-500/20 text-gray-300 border-gray-500/30",
      Pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      Cancelled: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    };

    return (
      <Badge variant="outline" className={styles[status]}>
        {status}
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
    deleteProforma.mutate(id, {
      onSuccess: () => {
        router.push("/dashboard/proforma");
      },
    });
  };

  const handleStatusChange = (newStatus: string) => {
    updateProforma.mutate({
      id,
      data: { status: newStatus },
    });
  };

  const handlePreviewPdf = async () => {
    setPdfLoading(true);
    try {
      const response = await axiosInstance.get(`/api/proforma-invoices/${id}/pdf`, {
        responseType: "blob",
        withCredentials: true,
      });

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      setPdfBlobUrl(url);
      setShowPdfPreview(true);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to preview PDF";
      alert(`Failed to preview PDF: ${errorMessage}`);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    setPdfLoading(true);
    try {
      const response = await axiosInstance.get(`/api/proforma-invoices/${id}/pdf`, {
        responseType: "blob",
      });

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `proforma-${proforma?.number || id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to download PDF";
      alert(`Failed to download PDF: ${errorMessage}`);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleClosePreview = () => {
    setShowPdfPreview(false);
    if (pdfBlobUrl) {
      window.URL.revokeObjectURL(pdfBlobUrl);
      setPdfBlobUrl(null);
    }
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

  if (error || !proforma) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <FileText className="h-16 w-16 text-gray-600 mx-auto" />
          <div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              Proforma invoice not found
            </h3>
            <p className="text-gray-400 mb-6">
              The proforma invoice you're looking for doesn't exist or has been deleted
            </p>
            <Button
              onClick={() => router.push("/dashboard/proforma")}
              className="bg-brand-yellow-500 text-black hover:bg-brand-yellow-600"
            >
              Back to Proforma Invoices
            </Button>
          </div>
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
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white">
                {proforma.number}
              </h1>
              {getStatusBadge(proforma.status)}
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                Proforma
              </Badge>
            </div>
            <p className="text-gray-400 mt-1">
              Created{" "}
              {proforma.createdAt
                ? formatDistanceToNow(new Date(proforma.createdAt), {
                    addSuffix: true,
                  })
                : "Unknown"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {proforma.status === "Draft" && canEdit() && (
            <Button
              onClick={() => handleStatusChange("Pending")}
              disabled={updateProforma.isPending}
              className="bg-brand-yellow-500 text-black hover:bg-brand-yellow-600"
            >
              Submit Proforma
            </Button>
          )}

          {proforma.status === "Pending" && canEdit() && (
            <Button
              onClick={() => handleStatusChange("Cancelled")}
              disabled={updateProforma.isPending}
              variant="outline"
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}

          <Dialog open={showPdfPreview} onOpenChange={handleClosePreview}>
            <DialogTrigger asChild>
              <Button
                onClick={handlePreviewPdf}
                disabled={pdfLoading}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/5"
              >
                {pdfLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4 mr-2" />
                )}
                Preview
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-white/10 max-w-6xl h-[90vh] p-0 flex flex-col gap-0">
              <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4">
                <DialogTitle className="text-white">
                  Proforma Preview - {proforma?.number}
                </DialogTitle>
              </DialogHeader>
              <div className="flex-1 px-6 pb-6" style={{ minHeight: 0 }}>
                {pdfBlobUrl ? (
                  <iframe
                    src={pdfBlobUrl}
                    className="w-full h-full rounded-lg border border-white/10"
                    title="Proforma PDF Preview"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-yellow-500" />
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Button
            onClick={handleDownloadPdf}
            disabled={pdfLoading}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/5"
          >
            {pdfLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Download
          </Button>

          {canEdit() && proforma.status === "Draft" && (
            <Button
              onClick={() => router.push(`/dashboard/proforma/${id}/edit`)}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/5"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}

          {canDelete() && proforma.status === "Draft" && (
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
                    Delete Proforma Invoice?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-400">
                    This action cannot be undone. This will permanently delete
                    the proforma invoice and remove it from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {deleteProforma.isPending ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-blue-300 text-sm">
          This is a non-posting proforma invoice. It does not affect your financial
          records or inventory. Use this for quotations and estimates only.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Buyer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Type</p>
                  <p className="text-white">{proforma.buyerType || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">TIN</p>
                  <p className="text-white font-mono">
                    {proforma.buyerTin || "—"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Legal Name</p>
                  <p className="text-white">{proforma.buyerLegalName || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Trade Name</p>
                  <p className="text-white">{proforma.buyerTradeName || "—"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Phone</p>
                  <p className="text-white">{proforma.buyerPhone || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">VAT Number</p>
                  <p className="text-white font-mono">
                    {proforma.buyerVatNumber || "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {proforma.lines?.map((line: any, index: number) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="text-white font-medium">
                          {line.description}
                        </p>
                        <p className="text-sm text-gray-400">
                          {line.quantity} {line.unit} ×{" "}
                          {formatCurrency(line.unitPrice)}
                        </p>
                      </div>
                      <p className="text-white font-bold">
                        {formatCurrency(line.lineTotal)}
                      </p>
                    </div>
                    {line.isVatApplicable && (
                      <Badge
                        variant="outline"
                        className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs"
                      >
                        VAT Applicable
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {proforma.notes && (
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Terms & Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 whitespace-pre-wrap">
                  {proforma.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-brand-yellow-500/10 to-transparent border-brand-yellow-500/20">
            <CardHeader>
              <CardTitle className="text-white">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Subtotal:</span>
                <span className="text-white font-medium">
                  {formatCurrency(Number(proforma.subtotal))}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">VAT:</span>
                <span className="text-white font-medium">
                  {formatCurrency(Number(proforma.vatAmount))}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-white/10">
                <span className="text-white font-medium">Total:</span>
                <span className="text-white font-bold text-xl">
                  {formatCurrency(Number(proforma.total))}
                </span>
              </div>
              {proforma.withheldAmount && Number(proforma.withheldAmount) > 0 && (
                <>
                  <div className="flex justify-between items-center text-red-400">
                    <span>Withholding:</span>
                    <span>
                      -{formatCurrency(Number(proforma.withheldAmount))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-white/10">
                    <span className="text-brand-yellow-500 font-medium">
                      Net Payable:
                    </span>
                    <span className="text-brand-yellow-500 font-bold text-xl">
                      {formatCurrency(Number(proforma.netPayable))}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Proforma Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-gray-400">Issue Date</p>
                <p className="text-white">
                  {format(new Date(proforma.invoiceDate), "PPP")}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Valid Until</p>
                <p className="text-white">
                  {format(new Date(proforma.dueDate), "PPP")}
                </p>
              </div>
              <div className="pt-2 border-t border-white/10">
                <p className="text-gray-400">Goods/Service</p>
                <p className="text-white">{proforma.goodsOrService}</p>
              </div>
              <div className="pt-2 border-t border-white/10">
                <p className="text-gray-400">Created By</p>
                <p className="text-white">{proforma.createdBy || "—"}</p>
              </div>
              {proforma.receivedBy && (
                <div>
                  <p className="text-gray-400">Received By</p>
                  <p className="text-white">{proforma.receivedBy}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


import { createRoute } from "@/lib/api/route-handler";
import { withTenantContext } from "@/infrastructure/database/prisma";
import { NotFoundError, ValidationError } from "@/lib/utils/errors";
import { uuidSchema } from "@/lib/validation/schemas";

function money(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  if (
    typeof value === "object" &&
    value !== null &&
    "toNumber" in value &&
    typeof (value as { toNumber: unknown }).toNumber === "function"
  ) {
    return (value as { toNumber: () => number }).toNumber();
  }
  return Number(value) || 0;
}

function isoDate(date: Date | null): string | null {
  return date ? date.toISOString() : null;
}

export const GET = createRoute(
  async ({ params, auth }) => {
    const id = params?.id;
    if (!id || !uuidSchema.safeParse(id).success) {
      throw new ValidationError("Invalid customer id", {
        id: ["Invalid customer id"],
      });
    }

    return await withTenantContext(auth!.orgId, async (tx) => {
      const customer = await tx.customer.findFirst({
        where: { id, orgId: auth!.orgId },
      });

      if (!customer) {
        throw new NotFoundError("Customer not found");
      }

      const matchers = [
        customer.tin ? { buyerTin: customer.tin } : null,
        customer.legalName ? { buyerLegalName: customer.legalName } : null,
        customer.tradeName ? { buyerTradeName: customer.tradeName } : null,
      ].filter(Boolean) as Array<
        | { buyerTin: string }
        | { buyerLegalName: string }
        | { buyerTradeName: string }
      >;

      const invoices =
        matchers.length > 0
          ? await tx.salesInvoice.findMany({
              where: {
                orgId: auth!.orgId,
                kind: "Invoice",
                OR: matchers,
              },
              orderBy: { invoiceDate: "desc" },
              select: {
                id: true,
                number: true,
                invoiceType: true,
                invoiceDate: true,
                dueDate: true,
                status: true,
                total: true,
                netPayable: true,
              },
            })
          : [];

      const invoiceIds = invoices.map((invoice) => invoice.id);
      const payments =
        invoiceIds.length > 0
          ? await tx.payment.findMany({
              where: {
                orgId: auth!.orgId,
                direction: "Incoming",
                relatedType: "Invoice",
                relatedId: { in: invoiceIds },
              },
              orderBy: { createdAt: "desc" },
              select: {
                id: true,
                relatedId: true,
                method: true,
                amount: true,
                advanceReceiptNumber: true,
                createdAt: true,
              },
            })
          : [];

      const paymentTotals = new Map<string, number>();
      payments.forEach((payment) => {
        if (!payment.relatedId) return;
        paymentTotals.set(
          payment.relatedId,
          (paymentTotals.get(payment.relatedId) || 0) + money(payment.amount)
        );
      });

      const invoiceEntries = invoices.map((invoice) => {
        const amount = money(invoice.netPayable);
        const paid =
          invoice.status === "Paid"
            ? amount
            : Math.min(paymentTotals.get(invoice.id) || 0, amount);
        const balance = Math.max(amount - paid, 0);

        return {
          id: invoice.id,
          type: "invoice" as const,
          date: invoice.invoiceDate.toISOString(),
          documentNumber: invoice.number,
          label:
            invoice.invoiceType === "Cash"
              ? "Cash Sales Attachment"
              : "Credit Invoice",
          amount,
          paid,
          balance,
          status: invoice.status,
          href: `/dashboard/sales/${invoice.id}`,
          dueDate: invoice.dueDate.toISOString(),
        };
      });

      const paymentEntries = payments.map((payment) => ({
        id: payment.id,
        type: "payment" as const,
        date: payment.createdAt.toISOString(),
        documentNumber: payment.advanceReceiptNumber || payment.id.slice(0, 8),
        label: `${payment.method} payment`,
        amount: -money(payment.amount),
        paid: money(payment.amount),
        balance: 0,
        status: "Recorded",
        href: `/dashboard/payments/${payment.id}`,
        dueDate: null,
      }));

      const entries = [...invoiceEntries, ...paymentEntries].toSorted(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      const totalInvoiced = invoiceEntries.reduce(
        (sum, entry) => sum + entry.amount,
        0
      );
      const totalPaid = invoiceEntries.reduce(
        (sum, entry) => sum + entry.paid,
        0
      );
      const now = new Date();
      const overdue = invoiceEntries.reduce((sum, entry) => {
        if (!entry.dueDate || entry.balance <= 0) return sum;
        return new Date(entry.dueDate) < now ? sum + entry.balance : sum;
      }, 0);

      return {
        customer: {
          ...customer,
          createdAt: isoDate(customer.createdAt),
          updatedAt: isoDate(customer.updatedAt),
        },
        summary: {
          totalInvoiced,
          totalPaid,
          outstanding: Math.max(totalInvoiced - totalPaid, 0),
          overdue,
          invoiceCount: invoices.length,
          paymentCount: payments.length,
        },
        entries,
      };
    });
  },
  {
    requireAuth: true,
    rateLimit: "queries",
  }
);

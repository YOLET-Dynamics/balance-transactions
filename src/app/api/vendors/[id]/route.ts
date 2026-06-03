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
      throw new ValidationError("Invalid vendor id", {
        id: ["Invalid vendor id"],
      });
    }

    return await withTenantContext(auth!.orgId, async (tx) => {
      const vendor = await tx.vendor.findFirst({
        where: { id, orgId: auth!.orgId },
      });

      if (!vendor) {
        throw new NotFoundError("Vendor not found");
      }

      const matchers = [
        vendor.tin ? { vendorTin: vendor.tin } : null,
        vendor.legalName ? { vendorLegalName: vendor.legalName } : null,
        vendor.tradeName ? { vendorTradeName: vendor.tradeName } : null,
      ].filter(Boolean) as Array<
        | { vendorTin: string }
        | { vendorLegalName: string }
        | { vendorTradeName: string }
      >;

      const bills =
        matchers.length > 0
          ? await tx.purchaseBill.findMany({
              where: {
                orgId: auth!.orgId,
                OR: matchers,
              },
              orderBy: { createdAt: "desc" },
              select: {
                id: true,
                number: true,
                createdAt: true,
                status: true,
                total: true,
                netPaid: true,
                reason: true,
              },
            })
          : [];

      const billIds = bills.map((bill) => bill.id);
      const payments =
        billIds.length > 0
          ? await tx.payment.findMany({
              where: {
                orgId: auth!.orgId,
                direction: "Outgoing",
                relatedType: "Bill",
                relatedId: { in: billIds },
              },
              orderBy: { createdAt: "desc" },
              select: {
                id: true,
                relatedId: true,
                method: true,
                amount: true,
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

      const billEntries = bills.map((bill) => {
        const amount = money(bill.netPaid);
        const paid =
          bill.status === "Paid"
            ? amount
            : Math.min(paymentTotals.get(bill.id) || 0, amount);
        const balance = Math.max(amount - paid, 0);

        return {
          id: bill.id,
          type: "bill" as const,
          date: bill.createdAt.toISOString(),
          documentNumber: bill.number,
          label: bill.reason || "Purchase bill",
          amount,
          paid,
          balance,
          status: bill.status,
          href: `/dashboard/purchases/${bill.id}`,
          daysOpen: Math.max(
            Math.floor(
              (Date.now() - bill.createdAt.getTime()) / (1000 * 60 * 60 * 24)
            ),
            0
          ),
        };
      });

      const paymentEntries = payments.map((payment) => ({
        id: payment.id,
        type: "payment" as const,
        date: payment.createdAt.toISOString(),
        documentNumber: payment.id.slice(0, 8),
        label: `${payment.method} payment`,
        amount: -money(payment.amount),
        paid: money(payment.amount),
        balance: 0,
        status: "Recorded",
        href: `/dashboard/payments/${payment.id}`,
        daysOpen: null,
      }));

      const entries = [...billEntries, ...paymentEntries].toSorted(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      const totalBilled = billEntries.reduce(
        (sum, entry) => sum + entry.amount,
        0
      );
      const totalPaid = billEntries.reduce(
        (sum, entry) => sum + entry.paid,
        0
      );
      const oldOpen = billEntries.reduce((sum, entry) => {
        if (entry.balance <= 0 || entry.daysOpen < 30) return sum;
        return sum + entry.balance;
      }, 0);

      return {
        vendor: {
          ...vendor,
          createdAt: isoDate(vendor.createdAt),
          updatedAt: isoDate(vendor.updatedAt),
        },
        summary: {
          totalBilled,
          totalPaid,
          outstanding: Math.max(totalBilled - totalPaid, 0),
          oldOpen,
          billCount: bills.length,
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

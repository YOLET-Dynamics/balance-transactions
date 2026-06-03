import { withTenantContext } from "@/infrastructure/database/prisma";
import type {
  Payment,
  CreatePaymentData,
  ListOptions,
  IPaymentsRepository,
  RelatedType,
} from "@/domain/repositories/payments.repository";
import { NotFoundError } from "@/lib/utils/errors";

function serializePayment(payment: any): Payment {
  if (!payment) return payment;

  return {
    ...payment,
    amount: payment.amount ? Number(payment.amount) : 0,
    createdAt: payment.createdAt ? payment.createdAt.toISOString() : null,
    updatedAt: payment.updatedAt ? payment.updatedAt.toISOString() : null,
  };
}

class PaymentsRepositoryImpl implements IPaymentsRepository {
  async create(orgId: string, data: CreatePaymentData): Promise<Payment> {
    return await withTenantContext(orgId, async (tx) => {
      const payment = await tx.payment.create({
        data: {
          orgId,
          direction: data.direction as any,
          method: data.method as any,
          amount: data.amount,
          currency: data.currency || "ETB",
          relatedType: data.relatedType as any,
          relatedId: data.relatedId,
          advanceReceiptNumber: data.advanceReceiptNumber,
          createdBy: data.createdBy,
          reviewedBy: data.reviewedBy,
          authorizedBy: data.authorizedBy,
        },
      });

      return serializePayment(payment);
    });
  }

  async findById(orgId: string, id: string): Promise<Payment | null> {
    return await withTenantContext(orgId, async (tx) => {
      const payment = await tx.payment.findFirst({
        where: { id, orgId },
      });

      if (!payment) {
        throw new NotFoundError("Payment not found");
      }

      return serializePayment(payment);
    });
  }

  async list(
    orgId: string,
    options: ListOptions
  ): Promise<{ payments: Payment[]; total: number }> {
    return await withTenantContext(orgId, async (tx) => {
      const where: any = { orgId };

      if (options.search) {
        where.OR = [
          { id: { contains: options.search, mode: "insensitive" } },
          { createdBy: { contains: options.search, mode: "insensitive" } },
        ];
      }

      if (options.direction) {
        where.direction = options.direction;
      }

      if (options.relatedType) {
        where.relatedType = options.relatedType;
      }

      if (options.relatedId) {
        where.relatedId = options.relatedId;
      }

      if (options.year) {
        const startDate = new Date(options.year, 0, 1);
        const endDate = new Date(options.year + 1, 0, 1);
        where.createdAt = {
          gte: startDate,
          lt: endDate,
        };
      }

      const [payments, total] = await Promise.all([
        tx.payment.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip:
            options.page && options.limit
              ? (options.page - 1) * options.limit
              : undefined,
          take: options.limit,
        }),
        tx.payment.count({ where }),
      ]);

      return {
        payments: payments.map(serializePayment),
        total,
      };
    });
  }

  async update(
    orgId: string,
    id: string,
    data: Partial<CreatePaymentData>
  ): Promise<Payment> {
    return await withTenantContext(orgId, async (tx) => {
      const result = await tx.payment.updateMany({
        where: { id, orgId },
        data: {
          direction: data.direction as any,
          method: data.method as any,
          amount: data.amount,
          currency: data.currency,
          relatedType: data.relatedType as any,
          relatedId: data.relatedId,
          advanceReceiptNumber: data.advanceReceiptNumber,
          createdBy: data.createdBy,
          reviewedBy: data.reviewedBy,
          authorizedBy: data.authorizedBy,
        },
      });

      if (result.count === 0) {
        throw new NotFoundError("Payment not found");
      }

      const payment = await tx.payment.findFirst({
        where: { id, orgId },
      });

      return serializePayment(payment);
    });
  }

  async delete(orgId: string, id: string): Promise<void> {
    await withTenantContext(orgId, async (tx) => {
      const result = await tx.payment.deleteMany({ where: { id, orgId } });

      if (result.count === 0) {
        throw new NotFoundError("Payment not found");
      }
    });
  }

  async getRecentPayments(orgId: string, limit: number): Promise<Payment[]> {
    return await withTenantContext(orgId, async (tx) => {
      const payments = await tx.payment.findMany({
        where: { orgId },
        orderBy: { createdAt: "desc" },
        take: limit,
      });

      return payments.map(serializePayment);
    });
  }

  async sumForRelated(
    orgId: string,
    relatedType: RelatedType,
    relatedId: string
  ): Promise<number> {
    return await withTenantContext(orgId, async (tx) => {
      const result = await tx.payment.aggregate({
        where: { orgId, relatedType: relatedType as any, relatedId },
        _sum: { amount: true },
      });

      return Number(result._sum.amount || 0);
    });
  }
}

export const paymentsRepository = new PaymentsRepositoryImpl();

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Execute a transaction with RLS context set
 * @param orgId - Organization ID for tenant isolation
 * @param fn - Transaction callback
 */
export async function withTenantContext<T>(
  orgId: string,
  fn: (tx: PrismaClient) => Promise<T>
): Promise<T> {
  return await prisma.$transaction(async (tx) => {
    // Set the org_id context variable for RLS
    await tx.$executeRawUnsafe(`SET LOCAL app.org_id = '${orgId}'`);
    return await fn(tx as PrismaClient);
  });
}

export type { PrismaClient };


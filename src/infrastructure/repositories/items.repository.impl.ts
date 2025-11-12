import { prisma } from "@/infrastructure/database/prisma";
import type {
  Item,
  CreateItemData,
  ListItemsOptions,
  IItemsRepository,
} from "@/domain/repositories/items.repository";

async function withTenantContext<T>(
  orgId: string,
  operation: (tx: typeof prisma) => Promise<T>
): Promise<T> {
  return operation(prisma);
}

function serializeItem(item: any): Item {
  if (!item) return item;

  return {
    ...item,
    defaultPrice: item.defaultPrice ? Number(item.defaultPrice) : 0,
    createdAt: item.createdAt ? item.createdAt.toISOString() : null,
    updatedAt: item.updatedAt ? item.updatedAt.toISOString() : null,
  };
}

class ItemsRepositoryImpl implements IItemsRepository {
  async create(orgId: string, data: CreateItemData): Promise<Item> {
    return await withTenantContext(orgId, async (tx) => {
      const item = await tx.item.create({
        data: {
          orgId,
          type: data.type as any,
          code: data.code,
          name: data.name,
          description: data.description,
          unit: data.unit,
          sku: data.sku,
          barcode: data.barcode,
          defaultPrice: data.defaultPrice,
          vatApplicable: data.vatApplicable ?? true,
          isActive: data.isActive ?? true,
        },
      });

      return serializeItem(item);
    });
  }

  async findById(orgId: string, id: string): Promise<Item | null> {
    return await withTenantContext(orgId, async (tx) => {
      const item = await tx.item.findFirst({
        where: { id, orgId },
      });

      return serializeItem(item);
    });
  }

  async findByCode(orgId: string, code: string): Promise<Item | null> {
    return await withTenantContext(orgId, async (tx) => {
      const item = await tx.item.findFirst({
        where: { orgId, code },
      });

      return serializeItem(item);
    });
  }

  async list(
    orgId: string,
    options: ListItemsOptions
  ): Promise<{ items: Item[]; total: number }> {
    return await withTenantContext(orgId, async (tx) => {
      const where: any = { orgId };

      if (options.search) {
        where.OR = [
          { name: { contains: options.search, mode: "insensitive" } },
          { code: { contains: options.search, mode: "insensitive" } },
          { description: { contains: options.search, mode: "insensitive" } },
        ];
      }

      if (options.type) {
        where.type = options.type;
      }

      if (options.isActive !== undefined) {
        where.isActive = options.isActive;
      }

      const [items, total] = await Promise.all([
        tx.item.findMany({
          where,
          orderBy: { name: "asc" },
          skip:
            options.page && options.limit
              ? (options.page - 1) * options.limit
              : undefined,
          take: options.limit,
        }),
        tx.item.count({ where }),
      ]);

      return {
        items: items.map(serializeItem),
        total,
      };
    });
  }

  async update(
    orgId: string,
    id: string,
    data: Partial<CreateItemData>
  ): Promise<Item> {
    return await withTenantContext(orgId, async (tx) => {
      const item = await tx.item.update({
        where: { id },
        data: {
          type: data.type as any,
          code: data.code,
          name: data.name,
          description: data.description,
          unit: data.unit,
          sku: data.sku,
          barcode: data.barcode,
          defaultPrice: data.defaultPrice,
          vatApplicable: data.vatApplicable,
          isActive: data.isActive,
        },
      });

      return serializeItem(item);
    });
  }

  async delete(orgId: string, id: string): Promise<void> {
    await withTenantContext(orgId, async (tx) => {
      await tx.item.delete({
        where: { id },
      });
    });
  }
}

export const itemsRepository = new ItemsRepositoryImpl();


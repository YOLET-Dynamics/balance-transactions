export type ItemType = "Good" | "Service";

export interface CreateItemData {
  type: ItemType;
  code: string;
  name: string;
  description?: string;
  unit: string;
  sku?: string;
  barcode?: string;
  defaultPrice: number;
  vatApplicable?: boolean;
  isActive?: boolean;
}

export interface Item {
  id: string;
  orgId: string;
  type: ItemType;
  code: string;
  name: string;
  description: string | null;
  unit: string;
  sku: string | null;
  barcode: string | null;
  defaultPrice: number;
  vatApplicable: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListItemsOptions {
  page?: number;
  limit?: number;
  search?: string;
  type?: ItemType;
  isActive?: boolean;
}

export interface IItemsRepository {
  create(orgId: string, data: CreateItemData): Promise<Item>;
  findById(orgId: string, id: string): Promise<Item | null>;
  findByCode(orgId: string, code: string): Promise<Item | null>;
  list(
    orgId: string,
    options: ListItemsOptions
  ): Promise<{ items: Item[]; total: number }>;
  update(orgId: string, id: string, data: Partial<CreateItemData>): Promise<Item>;
  delete(orgId: string, id: string): Promise<void>;
}


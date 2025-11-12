import { itemsRepository } from "@/infrastructure/repositories/items.repository.impl";
import type {
  Item,
  ItemType,
  ListItemsOptions,
} from "@/domain/repositories/items.repository";
import { NotFoundError } from "@/lib/utils/errors";

interface CreateItemInput {
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

class ItemsService {
  private itemsRepo = itemsRepository;

  async createItem(orgId: string, input: CreateItemInput): Promise<Item> {
    // Check if code already exists
    const existing = await this.itemsRepo.findByCode(orgId, input.code);
    if (existing) {
      throw new Error("Item code already exists");
    }

    return await this.itemsRepo.create(orgId, input);
  }

  async getItemById(orgId: string, id: string): Promise<Item> {
    const item = await this.itemsRepo.findById(orgId, id);
    if (!item) {
      throw new NotFoundError("Item not found");
    }
    return item;
  }

  async listItems(orgId: string, options: ListItemsOptions) {
    return await this.itemsRepo.list(orgId, options);
  }

  async updateItem(
    orgId: string,
    id: string,
    input: Partial<CreateItemInput>
  ): Promise<Item> {
    // If code is being updated, check if it already exists
    if (input.code) {
      const existing = await this.itemsRepo.findByCode(orgId, input.code);
      if (existing && existing.id !== id) {
        throw new Error("Item code already exists");
      }
    }

    return await this.itemsRepo.update(orgId, id, input);
  }

  async deleteItem(orgId: string, id: string): Promise<void> {
    await this.itemsRepo.delete(orgId, id);
  }
}

export const itemsService = new ItemsService();


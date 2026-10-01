import { Inventory, IInventory } from '../models/Inventory';
import { Product } from '../models/Product';
import { ApiError } from '../utils/ApiError';
import { InventoryStatus } from '../types';

export interface UpdateInventoryInput {
  stock?: number;
  minimumStock?: number;
}

export class InventoryService {
  async findAll(filters: { restaurant?: string; product?: string; status?: InventoryStatus } = {}): Promise<IInventory[]> {
    const query: Record<string, unknown> = {};
    if (filters.restaurant) query.restaurant = filters.restaurant;
    if (filters.product) query.product = filters.product;
    if (filters.status) query.status = filters.status;

    return Inventory.find(query).populate('product', 'name').sort({ updatedAt: -1 });
  }

  async findById(id: string): Promise<IInventory> {
    const inventory = await Inventory.findById(id).populate('product', 'name');
    if (!inventory) throw new ApiError(404, 'Inventory not found');
    return inventory;
  }

  async update(id: string, data: UpdateInventoryInput): Promise<IInventory> {
    const inventory = await Inventory.findById(id);
    if (!inventory) throw new ApiError(404, 'Inventory not found');

    if (data.stock !== undefined) {
      if (data.stock < 0) throw new ApiError(400, 'Stock cannot be negative');
      inventory.stock = data.stock;
    }
    if (data.minimumStock !== undefined) {
      if (data.minimumStock < 0) throw new ApiError(400, 'Minimum stock cannot be negative');
      inventory.minimumStock = data.minimumStock;
    }

    // Auto-update status
    if (inventory.stock === 0) {
      inventory.status = InventoryStatus.OUT_OF_STOCK;
    } else if (inventory.stock <= inventory.minimumStock) {
      inventory.status = InventoryStatus.LOW_STOCK;
    } else {
      inventory.status = InventoryStatus.AVAILABLE;
    }

    await inventory.save();
    return inventory;
  }

  async create(productId: string, restaurantId: string, stock: number, minimumStock: number): Promise<IInventory> {
    const product = await Product.findById(productId);
    if (!product) throw new ApiError(404, 'Product not found');

    const existing = await Inventory.findOne({ product: productId });
    if (existing) throw new ApiError(409, 'Inventory already exists for this product');

    const inventory = await Inventory.create({
      restaurant: restaurantId,
      product: productId,
      stock,
      minimumStock,
    });

    return inventory;
  }
}

export const inventoryService = new InventoryService();

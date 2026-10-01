import { Request, Response } from 'express';
import { inventoryService } from '../services/inventoryService';
import { catchAsync } from '../utils/catchAsync';
import { InventoryStatus } from '../types';

export const getInventory = catchAsync(async (req: Request, res: Response) => {
  const { restaurant, product, status } = req.query;
  const filters: { restaurant?: string; product?: string; status?: InventoryStatus } = {};
  if (restaurant) filters.restaurant = restaurant as string;
  if (product) filters.product = product as string;
  if (status && Object.values(InventoryStatus).includes(status as InventoryStatus)) {
    filters.status = status as InventoryStatus;
  }

  const inventory = await inventoryService.findAll(filters);
  res.json({ success: true, data: inventory.map((i) => i.toJSON()) });
});

export const getInventoryItem = catchAsync(async (req: Request, res: Response) => {
  const item = await inventoryService.findById(req.params.id);
  res.json({ success: true, data: item.toJSON() });
});

export const updateInventory = catchAsync(async (req: Request, res: Response) => {
  const item = await inventoryService.update(req.params.id, req.body);
  res.json({ success: true, data: item.toJSON() });
});

export const createInventory = catchAsync(async (req: Request, res: Response) => {
  const { product, restaurant, stock, minimumStock } = req.body;
  const item = await inventoryService.create(product, restaurant, stock, minimumStock);
  res.status(201).json({ success: true, data: item.toJSON() });
});

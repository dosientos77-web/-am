import { Request, Response } from 'express';
import { productService } from '../services/productService';
import { catchAsync } from '../utils/catchAsync';

export const createProduct = catchAsync(async (req: Request, res: Response) => {
  const { restaurant, category, name, description, image, price } = req.body;
  const product = await productService.create({ restaurant, category, name, description, image, price });
  res.status(201).json({ success: true, data: product.toJSON() });
});

export const getProducts = catchAsync(async (req: Request, res: Response) => {
  const { restaurant, category, available } = req.query;
  const filters: { restaurant?: string; category?: string; available?: boolean } = {};
  if (restaurant) filters.restaurant = restaurant as string;
  if (category) filters.category = category as string;
  if (available !== undefined) filters.available = available === 'true';

  const products = await productService.findAll(filters);
  res.json({ success: true, data: products.map((p) => p.toJSON()) });
});

export const getProduct = catchAsync(async (req: Request, res: Response) => {
  const product = await productService.findById(req.params.id);
  res.json({ success: true, data: product.toJSON() });
});

export const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const product = await productService.update(req.params.id, req.body);
  res.json({ success: true, data: product.toJSON() });
});

export const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  await productService.delete(req.params.id);
  res.json({ success: true, message: 'Product deleted' });
});

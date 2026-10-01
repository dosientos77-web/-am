import { Request, Response } from 'express';
import { categoryService } from '../services/categoryService';
import { catchAsync } from '../utils/catchAsync';

export const createCategory = catchAsync(async (req: Request, res: Response) => {
  const { name, description, restaurant } = req.body;
  const category = await categoryService.create({ name, description, restaurant });
  res.status(201).json({ success: true, data: category.toJSON() });
});

export const getCategories = catchAsync(async (req: Request, res: Response) => {
  const { restaurant } = req.query;
  const categories = await categoryService.findByRestaurant(restaurant as string);
  res.json({ success: true, data: categories.map((c) => c.toJSON()) });
});

export const getCategory = catchAsync(async (req: Request, res: Response) => {
  const category = await categoryService.findById(req.params.id);
  res.json({ success: true, data: category.toJSON() });
});

export const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const category = await categoryService.update(req.params.id, req.body);
  res.json({ success: true, data: category.toJSON() });
});

export const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  await categoryService.delete(req.params.id);
  res.json({ success: true, message: 'Category deleted' });
});

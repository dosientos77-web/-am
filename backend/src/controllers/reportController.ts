import { Request, Response } from 'express';
import { reportService } from '../services/reportService';
import { catchAsync } from '../utils/catchAsync';

export const getDashboardStats = catchAsync(async (_req: Request, res: Response) => {
  const stats = await reportService.getDashboardStats();
  res.json({ success: true, data: stats });
});

export const getSalesReport = catchAsync(async (req: Request, res: Response) => {
  const { startDate, endDate, restaurant } = req.query;
  const filters: { startDate?: Date; endDate?: Date; restaurant?: string } = {};
  if (startDate) filters.startDate = new Date(startDate as string);
  if (endDate) filters.endDate = new Date(endDate as string);
  if (restaurant) filters.restaurant = restaurant as string;

  const report = await reportService.getSalesReport(filters);
  res.json({ success: true, data: report });
});

export const getInventoryReport = catchAsync(async (req: Request, res: Response) => {
  const { restaurant } = req.query;
  const report = await reportService.getInventoryReport(restaurant as string);
  res.json({ success: true, data: report });
});

export const getTopRestaurants = catchAsync(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 5;
  const report = await reportService.getTopRestaurants(limit);
  res.json({ success: true, data: report });
});

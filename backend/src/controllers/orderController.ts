import { Request, Response } from 'express';
import { orderService } from '../services/orderService';
import { catchAsync } from '../utils/catchAsync';
import { OrderStatus } from '../types';

export const createOrder = catchAsync(async (req: Request, res: Response) => {
  const { restaurant, items, deliveryType, deliveryAddress, pickupTime } = req.body;
  const order = await orderService.create({
    customer: req.user!.userId,
    restaurant,
    items,
    deliveryType,
    deliveryAddress,
    pickupTime,
  });
  res.status(201).json({ success: true, data: order.toJSON() });
});

export const getOrders = catchAsync(async (req: Request, res: Response) => {
  const { customer, restaurant, status } = req.query;
  const filters: { customer?: string; restaurant?: string; status?: OrderStatus } = {};
  if (customer) filters.customer = customer as string;
  if (restaurant) filters.restaurant = restaurant as string;
  if (status && Object.values(OrderStatus).includes(status as OrderStatus)) {
    filters.status = status as OrderStatus;
  }

  const orders = await orderService.findAll(filters);
  res.json({ success: true, data: orders.map((o) => o.toJSON()) });
});

export const getOrder = catchAsync(async (req: Request, res: Response) => {
  const order = await orderService.findById(req.params.id);
  res.json({ success: true, data: order.toJSON() });
});

export const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const { status } = req.body;
  const order = await orderService.updateStatus(req.params.id, status, req.user!.role);
  res.json({ success: true, data: order.toJSON() });
});

export const cancelOrder = catchAsync(async (req: Request, res: Response) => {
  const order = await orderService.cancel(req.params.id, req.user!.userId, req.user!.role);
  res.json({ success: true, data: order.toJSON() });
});

export const confirmDelivery = catchAsync(async (req: Request, res: Response) => {
  const { code } = req.body;
  const order = await orderService.confirmDelivery(req.params.id, code);
  res.json({ success: true, data: order.toJSON() });
});

import { Request, Response } from 'express';
import { restaurantService } from '../services/restaurantService';
import { catchAsync } from '../utils/catchAsync';
import { UserRole, RestaurantStatus } from '../types';

export const createRestaurant = catchAsync(async (req: Request, res: Response) => {
  const { name, description, logo, category, openingHours, location, phone } = req.body;
  const restaurant = await restaurantService.create({
    name,
    description,
    logo,
    category,
    openingHours,
    location,
    phone,
    ownerId: req.user!.userId,
  });
  res.status(201).json({ success: true, data: restaurant.toJSON() });
});

export const getRestaurants = catchAsync(async (req: Request, res: Response) => {
  const { status, owner } = req.query;
  const filters: { status?: RestaurantStatus; owner?: string } = {};
  if (status && Object.values(RestaurantStatus).includes(status as RestaurantStatus)) {
    filters.status = status as RestaurantStatus;
  }
  if (owner) filters.owner = owner as string;

  const restaurants = await restaurantService.findAll(filters);
  res.json({ success: true, data: restaurants.map((r) => r.toJSON()) });
});

export const getRestaurant = catchAsync(async (req: Request, res: Response) => {
  const restaurant = await restaurantService.findById(req.params.id);
  res.json({ success: true, data: restaurant.toJSON() });
});

export const updateRestaurant = catchAsync(async (req: Request, res: Response) => {
  const restaurant = await restaurantService.update(
    req.params.id,
    req.body,
    req.user!.userId,
    req.user!.role
  );
  res.json({ success: true, data: restaurant.toJSON() });
});

export const approveRestaurant = catchAsync(async (req: Request, res: Response) => {
  const restaurant = await restaurantService.approve(req.params.id);
  res.json({ success: true, data: restaurant.toJSON() });
});

export const suspendRestaurant = catchAsync(async (req: Request, res: Response) => {
  const restaurant = await restaurantService.suspend(req.params.id);
  res.json({ success: true, data: restaurant.toJSON() });
});

export const activateRestaurant = catchAsync(async (req: Request, res: Response) => {
  const restaurant = await restaurantService.activate(req.params.id);
  res.json({ success: true, data: restaurant.toJSON() });
});

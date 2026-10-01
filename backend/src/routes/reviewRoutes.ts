import { Router } from 'express';
import { Review } from '../models/Review';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';
import { catchAsync } from '../utils/catchAsync';
import { ApiError } from '../utils/ApiError';

const router = Router();

router.get('/', authenticate, catchAsync(async (req, res) => {
  const { restaurant } = req.query;
  const query: Record<string, unknown> = {};
  if (restaurant) query.restaurant = restaurant;

  const reviews = await Review.find(query).populate('customer', 'name').populate('restaurant', 'name');
  res.json({ success: true, data: reviews.map((r) => r.toJSON()) });
}));

router.post('/', authenticate, authorize(UserRole.CUSTOMER), catchAsync(async (req, res) => {
  const { order, restaurant, rating, comment } = req.body;
  const review = await Review.create({
    order,
    customer: req.user!.userId,
    restaurant,
    rating,
    comment,
  });
  res.status(201).json({ success: true, data: review.toJSON() });
}));

export default router;

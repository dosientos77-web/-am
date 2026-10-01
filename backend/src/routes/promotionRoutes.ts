import { Router } from 'express';
import { Promotion } from '../models/Promotion';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';
import { catchAsync } from '../utils/catchAsync';
import { ApiError } from '../utils/ApiError';

const router = Router();

router.get('/', authenticate, catchAsync(async (req, res) => {
  const promotions = await Promotion.find({ active: true });
  res.json({ success: true, data: promotions.map((p) => p.toJSON()) });
}));

router.post('/', authenticate, authorize(UserRole.ADMIN), catchAsync(async (req, res) => {
  const promotion = await Promotion.create(req.body);
  res.status(201).json({ success: true, data: promotion.toJSON() });
}));

router.patch('/:id', authenticate, authorize(UserRole.ADMIN), catchAsync(async (req, res) => {
  const promotion = await Promotion.findById(req.params.id);
  if (!promotion) throw new ApiError(404, 'Promotion not found');

  Object.assign(promotion, req.body);
  await promotion.save();
  res.json({ success: true, data: promotion.toJSON() });
}));

export default router;

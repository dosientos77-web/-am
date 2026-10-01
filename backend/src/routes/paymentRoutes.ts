import { Router } from 'express';
import { Payment } from '../models/Payment';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';
import { catchAsync } from '../utils/catchAsync';
import { ApiError } from '../utils/ApiError';

const router = Router();

router.get('/', authenticate, authorize(UserRole.ADMIN), catchAsync(async (req, res) => {
  const payments = await Payment.find().populate('order');
  res.json({ success: true, data: payments.map((p) => p.toJSON()) });
}));

router.get('/:id', authenticate, authorize(UserRole.ADMIN), catchAsync(async (req, res) => {
  const payment = await Payment.findById(req.params.id).populate('order');
  if (!payment) throw new ApiError(404, 'Payment not found');
  res.json({ success: true, data: payment.toJSON() });
}));

export default router;

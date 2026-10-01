import { Router } from 'express';
import { Delivery } from '../models/Delivery';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';
import { catchAsync } from '../utils/catchAsync';
import { ApiError } from '../utils/ApiError';

const router = Router();

// Get all deliveries
router.get('/', authenticate, authorize(UserRole.DELIVERY, UserRole.ADMIN), catchAsync(async (req, res) => {
  const deliveries = await Delivery.find().populate('order').populate('deliveryPerson', 'name');
  res.json({ success: true, data: deliveries.map((d) => d.toJSON()) });
}));

// Get delivery by ID
router.get('/:id', authenticate, authorize(UserRole.DELIVERY, UserRole.ADMIN), catchAsync(async (req, res) => {
  const delivery = await Delivery.findById(req.params.id).populate('order').populate('deliveryPerson', 'name');
  if (!delivery) throw new ApiError(404, 'Delivery not found');
  res.json({ success: true, data: delivery.toJSON() });
}));

// Update delivery status
router.patch('/:id/status', authenticate, authorize(UserRole.DELIVERY, UserRole.ADMIN), catchAsync(async (req, res) => {
  const { status } = req.body;
  const delivery = await Delivery.findById(req.params.id);
  if (!delivery) throw new ApiError(404, 'Delivery not found');

  delivery.status = status;
  if (status === 'PICKED_UP') delivery.pickedUpAt = new Date();
  if (status === 'DELIVERED') delivery.deliveredAt = new Date();

  await delivery.save();
  res.json({ success: true, data: delivery.toJSON() });
}));

export default router;

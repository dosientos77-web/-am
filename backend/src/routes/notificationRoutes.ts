import { Router } from 'express';
import { Notification } from '../models/Notification';
import { authenticate } from '../middleware/auth';
import { catchAsync } from '../utils/catchAsync';
import { ApiError } from '../utils/ApiError';

const router = Router();

router.get('/', authenticate, catchAsync(async (req, res) => {
  const notifications = await Notification.find({ user: req.user!.userId }).sort({ createdAt: -1 });
  res.json({ success: true, data: notifications.map((n) => n.toJSON()) });
}));

router.patch('/:id/read', authenticate, catchAsync(async (req, res) => {
  const notification = await Notification.findOne({ _id: req.params.id, user: req.user!.userId });
  if (!notification) throw new ApiError(404, 'Notification not found');

  notification.read = true;
  await notification.save();
  res.json({ success: true, data: notification.toJSON() });
}));

export default router;

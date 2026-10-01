import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  confirmDelivery,
} from '../controllers/orderController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

router.get('/', authenticate, getOrders);
router.get('/:id', authenticate, getOrder);

router.post('/', authenticate, authorize(UserRole.CUSTOMER), createOrder);
router.patch('/:id/status', authenticate, authorize(UserRole.RESTAURANT, UserRole.ADMIN), updateOrderStatus);
router.post('/:id/cancel', authenticate, authorize(UserRole.CUSTOMER, UserRole.ADMIN), cancelOrder);
router.post('/:id/confirm-delivery', authenticate, authorize(UserRole.DELIVERY, UserRole.ADMIN), confirmDelivery);

export default router;

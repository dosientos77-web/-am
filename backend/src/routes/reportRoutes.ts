import { Router } from 'express';
import {
  getDashboardStats,
  getSalesReport,
  getInventoryReport,
  getTopRestaurants,
} from '../controllers/reportController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

router.get('/stats', authenticate, authorize(UserRole.ADMIN), getDashboardStats);
router.get('/sales', authenticate, authorize(UserRole.ADMIN, UserRole.RESTAURANT), getSalesReport);
router.get('/inventory', authenticate, authorize(UserRole.ADMIN, UserRole.RESTAURANT), getInventoryReport);
router.get('/top-restaurants', authenticate, authorize(UserRole.ADMIN), getTopRestaurants);

export default router;

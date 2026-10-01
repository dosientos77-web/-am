import { Router } from 'express';
import {
  createRestaurant,
  getRestaurants,
  getRestaurant,
  updateRestaurant,
  approveRestaurant,
  suspendRestaurant,
  activateRestaurant,
} from '../controllers/restaurantController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

// Public routes
router.get('/', getRestaurants);
router.get('/:id', getRestaurant);

// Protected routes
router.post('/', authenticate, authorize(UserRole.RESTAURANT, UserRole.ADMIN), createRestaurant);
router.patch('/:id', authenticate, authorize(UserRole.RESTAURANT, UserRole.ADMIN), updateRestaurant);

// Admin only routes
router.patch('/:id/approve', authenticate, authorize(UserRole.ADMIN), approveRestaurant);
router.patch('/:id/suspend', authenticate, authorize(UserRole.ADMIN), suspendRestaurant);
router.patch('/:id/activate', authenticate, authorize(UserRole.ADMIN), activateRestaurant);

export default router;

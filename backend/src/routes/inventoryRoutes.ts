import { Router } from 'express';
import {
  getInventory,
  getInventoryItem,
  updateInventory,
  createInventory,
} from '../controllers/inventoryController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

router.get('/', authenticate, authorize(UserRole.RESTAURANT, UserRole.ADMIN), getInventory);
router.post('/', authenticate, authorize(UserRole.RESTAURANT, UserRole.ADMIN), createInventory);
router.get('/:id', authenticate, authorize(UserRole.RESTAURANT, UserRole.ADMIN), getInventoryItem);
router.patch('/:id', authenticate, authorize(UserRole.RESTAURANT, UserRole.ADMIN), updateInventory);

export default router;

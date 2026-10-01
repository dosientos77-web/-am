import { Router } from 'express';
import {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

router.get('/', getCategories);
router.get('/:id', getCategory);

router.post('/', authenticate, authorize(UserRole.RESTAURANT, UserRole.ADMIN), createCategory);
router.patch('/:id', authenticate, authorize(UserRole.RESTAURANT, UserRole.ADMIN), updateCategory);
router.delete('/:id', authenticate, authorize(UserRole.RESTAURANT, UserRole.ADMIN), deleteCategory);

export default router;

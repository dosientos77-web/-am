import { Router } from 'express';
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

router.get('/', getProducts);
router.get('/:id', getProduct);

router.post('/', authenticate, authorize(UserRole.RESTAURANT, UserRole.ADMIN), createProduct);
router.patch('/:id', authenticate, authorize(UserRole.RESTAURANT, UserRole.ADMIN), updateProduct);
router.delete('/:id', authenticate, authorize(UserRole.RESTAURANT, UserRole.ADMIN), deleteProduct);

export default router;

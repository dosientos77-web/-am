import { Router } from 'express';
import { auditService } from '../services/auditService';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';
import { catchAsync } from '../utils/catchAsync';

const router = Router();

router.get('/', authenticate, authorize(UserRole.ADMIN), catchAsync(async (req, res) => {
  const { user, action, entity } = req.query;
  const filters: { user?: string; action?: any; entity?: string } = {};
  if (user) filters.user = user as string;
  if (action) filters.action = action as any;
  if (entity) filters.entity = entity as string;

  const logs = await auditService.findAll(filters);
  res.json({ success: true, data: logs.map((l) => l.toJSON()) });
}));

export default router;

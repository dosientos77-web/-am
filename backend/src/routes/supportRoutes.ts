import { Router } from 'express';
import { SupportTicket } from '../models/SupportTicket';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';
import { catchAsync } from '../utils/catchAsync';
import { ApiError } from '../utils/ApiError';

const router = Router();

router.get('/', authenticate, authorize(UserRole.ADMIN), catchAsync(async (req, res) => {
  const tickets = await SupportTicket.find().populate('user', 'name email').sort({ createdAt: -1 });
  res.json({ success: true, data: tickets.map((t) => t.toJSON()) });
}));

router.post('/', authenticate, catchAsync(async (req, res) => {
  const { subject, message, priority } = req.body;
  const ticket = await SupportTicket.create({
    user: req.user!.userId,
    subject,
    message,
    priority,
  });
  res.status(201).json({ success: true, data: ticket.toJSON() });
}));

router.patch('/:id', authenticate, authorize(UserRole.ADMIN), catchAsync(async (req, res) => {
  const ticket = await SupportTicket.findById(req.params.id);
  if (!ticket) throw new ApiError(404, 'Ticket not found');

  Object.assign(ticket, req.body);
  await ticket.save();
  res.json({ success: true, data: ticket.toJSON() });
}));

export default router;

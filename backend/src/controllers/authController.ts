import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { catchAsync } from '../utils/catchAsync';
import { UserRole } from '../types';

export const register = catchAsync(async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  // Only allow self-registration as CUSTOMER
  const requestedRole = role === UserRole.CUSTOMER ? UserRole.CUSTOMER : undefined;

  const { user, token } = await authService.register({
    name,
    email,
    password,
    role: requestedRole,
  });

  res.status(201).json({
    success: true,
    token,
    user: user.toJSON(),
  });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { user, token } = await authService.login({ email, password });

  res.json({
    success: true,
    token,
    user: user.toJSON(),
  });
});

export const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = await authService.getMe(req.user!.userId);
  res.json({
    success: true,
    user: user.toJSON(),
  });
});

export const logout = catchAsync(async (_req: Request, res: Response) => {
  // JWT is stateless; client should discard token
  res.json({ success: true, message: 'Logged out successfully' });
});

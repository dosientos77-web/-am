import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { UserRole, AuthPayload } from '../types';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  async register(input: RegisterInput): Promise<{ user: IUser; token: string }> {
    const { name, email, password, role } = input;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(409, 'Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, env.bcryptRounds);

    // Create user (only CUSTOMER can self-register)
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: role || UserRole.CUSTOMER,
    });

    const token = this.generateToken(user);
    return { user, token };
  }

  async login(input: LoginInput): Promise<{ user: IUser; token: string }> {
    const { email, password } = input;

    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password');
    }

    if (user.status !== 'ACTIVE') {
      throw new ApiError(403, 'Account is not active');
    }

    const token = this.generateToken(user);
    return { user, token };
  }

  async getMe(userId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  }

  generateToken(user: IUser): string {
    const payload: AuthPayload = {
      userId: user._id.toString(),
      role: user.role,
    };
    const options: SignOptions = { expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'] };
    return jwt.sign(payload, env.jwtSecret, options);
  }

  verifyToken(token: string): AuthPayload {
    try {
      return jwt.verify(token, env.jwtSecret) as AuthPayload;
    } catch {
      throw new ApiError(401, 'Invalid or expired token');
    }
  }
}

export const authService = new AuthService();

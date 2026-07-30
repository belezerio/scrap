import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';
import { RegisterInput, LoginInput } from '../schemas/auth.schema';
import { UserPayload } from '../types';

// In-memory user store fallback or Supabase db integration
interface DBUser {
  id: string;
  email: string;
  passwordHash: string;
  name?: string;
  createdAt: string;
}

const mockUserDatabase: Map<string, DBUser> = new Map();

export class AuthService {
  static async register(input: RegisterInput): Promise<{ user: UserPayload; token: string }> {
    const existing = Array.from(mockUserDatabase.values()).find((u) => u.email === input.email);
    if (existing) {
      throw AppError.badRequest('User with this email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(input.password, salt);

    const newUser: DBUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      email: input.email,
      passwordHash,
      name: input.name,
      createdAt: new Date().toISOString(),
    };

    mockUserDatabase.set(newUser.id, newUser);

    const userPayload: UserPayload = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    };

    const token = generateToken(userPayload);

    return { user: userPayload, token };
  }

  static async login(input: LoginInput): Promise<{ user: UserPayload; token: string }> {
    const user = Array.from(mockUserDatabase.values()).find((u) => u.email === input.email);
    if (!user) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const userPayload: UserPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    const token = generateToken(userPayload);

    return { user: userPayload, token };
  }

  static async getUserProfile(userId: string): Promise<UserPayload> {
    const user = mockUserDatabase.get(userId);
    if (!user) {
      throw AppError.notFound('User profile not found');
    }
    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }
}

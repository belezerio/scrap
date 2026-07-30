import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { successResponse } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export class AuthController {
  static register = async (req: Request, res: Response): Promise<void> => {
    const result = await AuthService.register(req.body);
    successResponse(res, result, 'Registration successful', 201);
  };

  static login = async (req: Request, res: Response): Promise<void> => {
    const result = await AuthService.login(req.body);
    successResponse(res, result, 'Login successful', 200);
  };

  static getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const profile = await AuthService.getUserProfile(userId);
    successResponse(res, profile, 'Profile retrieved successfully', 200);
  };
}

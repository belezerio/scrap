import jwt, { SignOptions } from 'jsonwebtoken';
import { UserPayload } from '../types';
import { config } from '../config/env';

export function generateToken(payload: UserPayload, expiresIn = config.JWT_EXPIRES_IN): string {
  const options: SignOptions = {
    expiresIn: expiresIn as any,
  };
  return jwt.sign(payload, config.JWT_SECRET, options);
}

export function verifyToken(token: string): UserPayload {
  return jwt.verify(token, config.JWT_SECRET) as UserPayload;
}

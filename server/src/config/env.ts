import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform((val) => parseInt(val, 10)).default('5000'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),

  JWT_SECRET: z.string().default('super_secret_jwt_key_change_in_production'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  SUPABASE_URL: z.string().optional().default('https://placeholder.supabase.co'),
  SUPABASE_ANON_KEY: z.string().optional().default('placeholder_anon_key'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default('placeholder_service_role_key'),

  GEMINI_API_KEY: z.string().optional().default(''),
  APIFY_API_TOKEN: z.string().optional().default(''),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment configuration:', _env.error.format());
  throw new Error('Invalid environment configuration');
}

export const config = _env.data;

import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('4000'),
  DATABASE_URL: z.string().min(1).default('postgresql://user:pass@localhost:5432/academia_ng'),
  JWT_ACCESS_SECRET: z.string().min(32).default('dev-access-secret-change-me-in-production-32'),
  JWT_REFRESH_SECRET: z.string().min(32).default('dev-refresh-secret-change-me-in-production-32'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().optional(),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
  RATE_LIMIT_MAX: z.string().default('100'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment configuration');
}

export const env = parsed.data;

export const config = {
  env: env.NODE_ENV,
  port: parseInt(env.PORT, 10),
  isDev: env.NODE_ENV === 'development',
  jwt: {
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },
  corsOrigin: env.CORS_ORIGIN?.split(',').map((o) => o.trim()) ?? true,
  rateLimit: {
    windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS, 10),
    max: parseInt(env.RATE_LIMIT_MAX, 10),
  },
};

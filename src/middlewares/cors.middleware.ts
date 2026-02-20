import { cors } from 'hono/cors';
import { MiddlewareHandler, Context } from 'hono';
import { AppEnv } from '../types';

export const corsMiddleware: MiddlewareHandler<AppEnv> = (c: Context<AppEnv>) => {
  const origins = c.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'];

  return cors({
    origin: origins,
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Content-Length', 'X-Request-Id'],
    maxAge: 86400,
  })(c, async () => {});
};

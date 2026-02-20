import { Context, MiddlewareHandler, Next } from 'hono';
import { AuthService } from '../services/auth.service';
import { AppEnv } from '../types';

export const authMiddleware: MiddlewareHandler<AppEnv> = async (c: Context<AppEnv>, next: Next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json(
      {
        success: false,
        message: 'Access token is required',
      },
      401
    );
  }

  const token = authHeader.substring(7);
  const jwtSecret = c.env.JWT_SECRET;

  try {
    const authService = new AuthService(
      c.get('userRepository'),
      jwtSecret,
      c.env.JWT_EXPIRES_IN,
      c.env.REMEMBER_TOKEN_EXPIRES_IN
    );
    const payload = authService.verifyToken(token);
    c.set('user', payload);
    await next();
  } catch (error) {
    return c.json(
      {
        success: false,
        message: 'Invalid or expired token',
      },
      401
    );
  }
};

export const optionalAuthMiddleware: MiddlewareHandler<AppEnv> = async (c: Context<AppEnv>, next: Next) => {
  const authHeader = c.req.header('Authorization');

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const jwtSecret = c.env.JWT_SECRET;

    try {
      const authService = new AuthService(
        c.get('userRepository'),
        jwtSecret,
        c.env.JWT_EXPIRES_IN,
        c.env.REMEMBER_TOKEN_EXPIRES_IN
      );
      const payload = authService.verifyToken(token);
      c.set('user', payload);
    } catch (error) {
    }
  }

  await next();
};

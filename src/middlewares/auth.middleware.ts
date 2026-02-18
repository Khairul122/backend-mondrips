import { Context, MiddlewareHandler, Next } from 'hono';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export const authMiddleware: MiddlewareHandler = async (c: Context, next: Next) => {
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

  try {
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

export const optionalAuthMiddleware: MiddlewareHandler = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const payload = authService.verifyToken(token);
      c.set('user', payload);
    } catch (error) {
    }
  }

  await next();
};

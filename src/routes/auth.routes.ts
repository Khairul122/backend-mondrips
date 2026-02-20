import { Hono } from 'hono';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { UserRepository } from '../repositories/user.repository';
import { AppEnv } from '../types';

const authController = new AuthController();

export const authRoutes = new Hono<{ Bindings: AppEnv['Bindings']; Variables: AppEnv['Variables'] }>();

authRoutes.use('*', (c, next) => {
  c.set('userRepository', new UserRepository(c.env.DB));
  return next();
});

authRoutes.post('/register', (c) => authController.register(c));
authRoutes.post('/login', (c) => authController.login(c));
authRoutes.post('/refresh', (c) => authController.refresh(c));
authRoutes.post('/logout', authMiddleware, (c) => authController.logout(c));
authRoutes.put('/change-password', authMiddleware, (c) => authController.changePassword(c));
authRoutes.get('/me', authMiddleware, (c) => authController.me(c));

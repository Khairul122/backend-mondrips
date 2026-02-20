import { Context } from 'hono';
import { AuthService } from '../services/auth.service';
import { UserRepository } from '../repositories/user.repository';
import { z } from 'zod';
import { AppEnv } from '../types';

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  username: z.string().min(3).max(50),
  password: z.string().min(8).regex(/[A-Za-z]/).regex(/[0-9]/),
  full_name: z.string().min(1).max(100),
});

const loginSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1),
  remember_me: z.boolean().optional().default(false),
});

const changePasswordSchema = z.object({
  current_password: z.string().min(1),
  new_password: z.string().min(8).regex(/[A-Za-z]/).regex(/[0-9]/),
});

export class AuthController {
  constructor() {}

  async register(c: Context<AppEnv>) {
    try {
      const body = await c.req.json();
      const validated = registerSchema.parse(body);

      const authService = new AuthService(
        c.get('userRepository'),
        c.env.JWT_SECRET,
        c.env.JWT_EXPIRES_IN,
        c.env.REMEMBER_TOKEN_EXPIRES_IN
      );

      const user = await authService.register(validated);

      return c.json(
        {
          success: true,
          message: 'Registration successful',
          data: user,
        },
        201
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json(
          {
            success: false,
            message: 'Validation error',
            errors: error.errors,
          },
          400
        );
      }

      if (error instanceof Error) {
        return c.json(
          {
            success: false,
            message: error.message,
          },
          400
        );
      }

      return c.json(
        {
          success: false,
          message: 'Registration failed',
        },
        500
      );
    }
  }

  async login(c: Context<AppEnv>) {
    try {
      const body = await c.req.json();
      const validated = loginSchema.parse(body);

      const authService = new AuthService(
        c.get('userRepository'),
        c.env.JWT_SECRET,
        c.env.JWT_EXPIRES_IN,
        c.env.REMEMBER_TOKEN_EXPIRES_IN
      );

      const result = await authService.login({
        identifier: validated.identifier,
        password: validated.password,
        rememberMe: validated.remember_me,
      });

      if (result.tokens.refreshToken) {
        const maxAge = 30 * 24 * 60 * 60;
        c.header('Set-Cookie', `remember_token=${result.tokens.refreshToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`);
      }

      return c.json({
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
          access_token: result.tokens.accessToken,
          token_type: 'Bearer',
          expires_in: c.env.JWT_EXPIRES_IN,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json(
          {
            success: false,
            message: 'Validation error',
            errors: error.errors,
          },
          400
        );
      }

      if (error instanceof Error) {
        return c.json(
          {
            success: false,
            message: error.message,
          },
          401
        );
      }

      return c.json(
        {
          success: false,
          message: 'Login failed',
        },
        500
      );
    }
  }

  async refresh(c: Context<AppEnv>) {
    try {
      const rememberToken = c.req.cookie('remember_token');

      if (!rememberToken) {
        return c.json(
          {
            success: false,
            message: 'Remember token not found',
          },
          401
        );
      }

      const authService = new AuthService(
        c.get('userRepository'),
        c.env.JWT_SECRET,
        c.env.JWT_EXPIRES_IN,
        c.env.REMEMBER_TOKEN_EXPIRES_IN
      );

      const result = await authService.refreshAccessToken(rememberToken);

      return c.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          access_token: result.accessToken,
          token_type: 'Bearer',
          expires_in: c.env.JWT_EXPIRES_IN,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        return c.json(
          {
            success: false,
            message: error.message,
          },
          401
        );
      }

      return c.json(
        {
          success: false,
          message: 'Token refresh failed',
        },
        500
      );
    }
  }

  async logout(c: Context<AppEnv>) {
    try {
      const user = c.get('user');
      if (!user) {
        return c.json(
          {
            success: false,
            message: 'Unauthorized',
          },
          401
        );
      }

      const authService = new AuthService(
        c.get('userRepository'),
        c.env.JWT_SECRET,
        c.env.JWT_EXPIRES_IN,
        c.env.REMEMBER_TOKEN_EXPIRES_IN
      );

      await authService.logout(user.id_user);

      c.header('Set-Cookie', 'remember_token=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0');

      return c.json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          message: 'Logout failed',
        },
        500
      );
    }
  }

  async changePassword(c: Context<AppEnv>) {
    try {
      const user = c.get('user');
      if (!user) {
        return c.json(
          {
            success: false,
            message: 'Unauthorized',
          },
          401
        );
      }

      const body = await c.req.json();
      const validated = changePasswordSchema.parse(body);

      const authService = new AuthService(
        c.get('userRepository'),
        c.env.JWT_SECRET,
        c.env.JWT_EXPIRES_IN,
        c.env.REMEMBER_TOKEN_EXPIRES_IN
      );

      await authService.changePassword(
        user.id_user,
        validated.current_password,
        validated.new_password
      );

      return c.json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json(
          {
            success: false,
            message: 'Validation error',
            errors: error.errors,
          },
          400
        );
      }

      if (error instanceof Error) {
        return c.json(
          {
            success: false,
            message: error.message,
          },
          400
        );
      }

      return c.json(
        {
          success: false,
          message: 'Password change failed',
        },
        500
      );
    }
  }

  async me(c: Context<AppEnv>) {
    try {
      const user = c.get('user');
      if (!user) {
        return c.json(
          {
            success: false,
            message: 'Unauthorized',
          },
          401
        );
      }

      return c.json({
        success: true,
        data: user,
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          message: 'Failed to get user info',
        },
        500
      );
    }
  }
}

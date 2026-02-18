import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UserRepository } from '../repositories/user.repository';
import { UserResponse } from '../models/user.model';

export interface RegisterInput {
  email: string;
  username: string;
  password: string;
  full_name: string;
}

export interface LoginInput {
  identifier: string;
  password: string;
  rememberMe: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface TokenPayload {
  id_user: number;
  email: string;
  username: string;
  role: string;
}

export class AuthService {
  private userRepository: UserRepository;
  private jwtSecret: string;
  private jwtExpiresIn: string;
  private rememberTokenExpiresIn: string;
  private saltRounds: number;

  constructor() {
    this.userRepository = new UserRepository();
    this.jwtSecret = process.env.JWT_SECRET || 'default-secret-key';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '15m';
    this.rememberTokenExpiresIn = process.env.REMEMBER_TOKEN_EXPIRES_IN || '30d';
    this.saltRounds = 12;
  }

  async register(input: RegisterInput): Promise<UserResponse> {
    const existingEmail = await this.userRepository.findByEmail(input.email);
    if (existingEmail) {
      throw new Error('Email already registered');
    }

    const existingUsername = await this.userRepository.findByUsername(input.username);
    if (existingUsername) {
      throw new Error('Username already taken');
    }

    const hashedPassword = await bcrypt.hash(input.password, this.saltRounds);

    const userId = await this.userRepository.create({
      email: input.email,
      username: input.username,
      password: hashedPassword,
      full_name: input.full_name,
      role: 'user',
    });

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('Failed to create user');
    }

    return this.toUserResponse(user);
  }

  async login(input: LoginInput): Promise<{ user: UserResponse; tokens: AuthTokens }> {
    const user = await this.userRepository.findByEmailOrUsername(input.identifier);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.is_active) {
      throw new Error('Account is deactivated');
    }

    const passwordValid = await bcrypt.compare(input.password, user.password);
    if (!passwordValid) {
      throw new Error('Invalid credentials');
    }

    await this.userRepository.update(user.id_user, {
      last_login: new Date(),
    });

    const tokens = await this.generateTokens(user);

    if (input.rememberMe) {
      const rememberToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = await bcrypt.hash(rememberToken, this.saltRounds);

      await this.userRepository.update(user.id_user, {
        remember_token: hashedToken,
      });

      tokens.refreshToken = rememberToken;
    }

    return {
      user: this.toUserResponse(user),
      tokens,
    };
  }

  async refreshAccessToken(rememberToken: string): Promise<{ accessToken: string }> {
    const users = await this.userRepository.findByRememberToken(rememberToken) as any;
    
    if (!users || !users.remember_token) {
      throw new Error('Invalid remember token');
    }

    const tokenValid = await bcrypt.compare(rememberToken, users.remember_token);
    if (!tokenValid) {
      throw new Error('Invalid remember token');
    }

    if (!users.is_active) {
      throw new Error('Account is deactivated');
    }

    const accessToken = this.generateAccessToken({
      id_user: users.id_user,
      email: users.email,
      username: users.username,
      role: users.role,
    });

    return { accessToken };
  }

  async logout(userId: number): Promise<void> {
    await this.userRepository.update(userId, {
      remember_token: null,
    });
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const passwordValid = await bcrypt.compare(currentPassword, user.password);
    if (!passwordValid) {
      throw new Error('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, this.saltRounds);
    await this.userRepository.update(userId, {
      password: hashedPassword,
    });
  }

  private generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    });
  }

  private generateRefreshToken(): string {
    const expiresIn = this.rememberTokenExpiresIn;
    return crypto.randomBytes(32).toString('hex');
  }

  private async generateTokens(user: any): Promise<AuthTokens> {
    const payload: TokenPayload = {
      id_user: user.id_user,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    return {
      accessToken: this.generateAccessToken(payload),
    };
  }

  private toUserResponse(user: any): UserResponse {
    return {
      id_user: user.id_user,
      email: user.email,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
      last_login: user.last_login,
    };
  }

  verifyToken(token: string): TokenPayload {
    return jwt.verify(token, this.jwtSecret) as TokenPayload;
  }
}

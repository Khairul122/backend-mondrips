import { UserRepository } from '../repositories/user.repository';
import { UserResponse } from '../models/user.model';
import { hashPassword, verifyPassword, generateRandomToken, hashToken } from '../utils/crypto';
import { generateAccessToken, verifyJWT, JWTPayload } from '../utils/jwt';

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

  constructor(userRepository: UserRepository, jwtSecret: string, jwtExpiresIn: string, rememberTokenExpiresIn: string) {
    this.userRepository = userRepository;
    this.jwtSecret = jwtSecret;
    this.jwtExpiresIn = jwtExpiresIn;
    this.rememberTokenExpiresIn = rememberTokenExpiresIn;
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

    const hashedPassword = await hashPassword(input.password);

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

    const passwordValid = await verifyPassword(input.password, user.password);
    if (!passwordValid) {
      throw new Error('Invalid credentials');
    }

    const lastLogin = new Date().toISOString().replace('T', ' ').substring(0, 19);
    await this.userRepository.update(user.id_user, {
      last_login: lastLogin as unknown as Date,
    });

    const tokens = await this.generateTokens(user);

    if (input.rememberMe) {
      const rememberToken = generateRandomToken();
      const hashedToken = await hashToken(rememberToken);

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
    const hashedToken = await hashToken(rememberToken);
    const user = await this.userRepository.findByRememberToken(hashedToken);

    if (!user) {
      throw new Error('Invalid remember token');
    }

    if (!user.is_active) {
      throw new Error('Account is deactivated');
    }

    const accessToken = await this.generateAccessToken({
      id_user: user.id_user,
      email: user.email,
      username: user.username,
      role: user.role,
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

    const passwordValid = await verifyPassword(currentPassword, user.password);
    if (!passwordValid) {
      throw new Error('Current password is incorrect');
    }

    const hashedPassword = await hashPassword(newPassword);
    await this.userRepository.update(userId, {
      password: hashedPassword,
    });
  }

  private async generateAccessToken(payload: Omit<TokenPayload, 'exp' | 'iat'>): Promise<string> {
    return await generateAccessToken(payload, this.jwtSecret, this.jwtExpiresIn);
  }

  private async generateTokens(user: any): Promise<AuthTokens> {
    const payload: Omit<TokenPayload, 'exp' | 'iat'> = {
      id_user: user.id_user,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    return {
      accessToken: await this.generateAccessToken(payload),
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

  async verifyToken(token: string): Promise<TokenPayload> {
    const payload = await verifyJWT(token, this.jwtSecret);
    return {
      id_user: payload.id_user,
      email: payload.email,
      username: payload.username,
      role: payload.role,
    };
  }
}

import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { query, queryOne, execute, insert } from '../../config/database';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../../common/middleware/auth';
import { UnauthorizedError, ValidationError } from '../../common/errors';
import { SignupInput, LoginInput, ChangePasswordInput } from './auth.schema';
import { SignupResponse, LoginResponse } from './auth.types';
import logger from '../../config/logger';

const SALT_ROUNDS = 12;

/**
 * Auth service — handles all authentication business logic.
 * Uses MySQL directly + bcrypt + JWT. No external auth provider.
 */
export class AuthService {
  /**
   * Register a new user.
   */
  async signup(input: SignupInput): Promise<SignupResponse> {
    // Check if user already exists
    const existing = await queryOne(
      'SELECT id FROM users WHERE email = ?',
      [input.email]
    );

    if (existing) {
      throw new ValidationError('Email already registered');
    }

    // Generate UUID for user
    const userId = uuidv4();
    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    // Insert user into MySQL
    await insert(
      'INSERT INTO users (id, email, name, password_hash) VALUES (?, ?, ?, ?)',
      [userId, input.email, input.name, passwordHash]
    );

    // Generate tokens
    const payload = { userId, email: input.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await insert(
      'INSERT INTO refresh_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)',
      [uuidv4(), userId, refreshToken, expiresAt]
    );

    logger.info({ userId }, 'User signed up successfully');

    return {
      user: { id: userId, email: input.email, name: input.name },
      tokens: { accessToken, refreshToken },
    };
  }

  /**
   * Login with email and password.
   */
  async login(input: LoginInput): Promise<LoginResponse> {
    // Find user by email
    const user = await queryOne<{ id: string; email: string; name: string; password_hash: string }>(
      'SELECT id, email, name, password_hash FROM users WHERE email = ?',
      [input.email]
    );

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Verify password
    const isValid = await bcrypt.compare(input.password, user.password_hash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate tokens
    const payload = { userId: user.id, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await insert(
      'INSERT INTO refresh_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)',
      [uuidv4(), user.id, refreshToken, expiresAt]
    );

    logger.info({ userId: user.id }, 'User logged in');

    return {
      user: { id: user.id, email: user.email, name: user.name },
      tokens: { accessToken, refreshToken },
    };
  }

  /**
   * Refresh access token using a valid refresh token.
   */
  async refreshToken(token: string): Promise<{ accessToken: string }> {
    // Verify JWT signature
    const decoded = verifyRefreshToken(token);

    // Check if refresh token exists in DB and hasn't been revoked
    const storedToken = await queryOne<{ id: string; expires_at: string }>(
      'SELECT id, expires_at FROM refresh_tokens WHERE user_id = ? AND token = ? AND revoked = 0',
      [decoded.userId, token]
    );

    if (!storedToken) {
      throw new UnauthorizedError('Invalid or revoked refresh token');
    }

    // Check expiration
    if (new Date(storedToken.expires_at) < new Date()) {
      throw new UnauthorizedError('Refresh token expired');
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      userId: decoded.userId,
      email: decoded.email,
    });

    // Rotate refresh token (invalidate old, issue new)
    const newRefreshToken = generateRefreshToken({
      userId: decoded.userId,
      email: decoded.email,
    });

    await execute(
      'UPDATE refresh_tokens SET revoked = 1 WHERE token = ?',
      [token]
    );

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await insert(
      'INSERT INTO refresh_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)',
      [uuidv4(), decoded.userId, newRefreshToken, expiresAt]
    );

    return { accessToken };
  }

  /**
   * Logout — revoke all refresh tokens for the user.
   */
  async logout(userId: string): Promise<void> {
    await execute(
      'UPDATE refresh_tokens SET revoked = 1 WHERE user_id = ?',
      [userId]
    );

    logger.info({ userId }, 'User logged out');
  }

  /**
   * Change password — requires current password verification.
   */
  async changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
    // Fetch current user
    const user = await queryOne<{ id: string; password_hash: string }>(
      'SELECT id, password_hash FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Verify current password
    const isValid = await bcrypt.compare(input.currentPassword, user.password_hash);
    if (!isValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // Check new password is different
    const isSame = await bcrypt.compare(input.newPassword, user.password_hash);
    if (isSame) {
      throw new ValidationError('New password must be different from current password');
    }

    // Hash and update
    const passwordHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);
    await execute(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [passwordHash, userId]
    );

    // Revoke all existing refresh tokens (force re-login on all devices)
    await execute(
      'UPDATE refresh_tokens SET revoked = 1 WHERE user_id = ?',
      [userId]
    );

    logger.info({ userId }, 'Password changed successfully');
  }
}

export const authService = new AuthService();

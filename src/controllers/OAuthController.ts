import { Request, Response, NextFunction } from 'express';
import { oauthService } from '../services/OAuthService.js';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import crypto from 'crypto';

interface AuthRequest extends Request {
  userId?: string;
}

class OAuthController {
  /**
   * Initiate OAuth flow
   */
  async initiateAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const state = crypto.randomBytes(32).toString('hex');
      const authUrl = oauthService.generateAuthorizationUrl(state);

      res.json({
        status: 'success',
        authUrl,
        state,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * OAuth callback handler
   */
  async handleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code } = req.query;

      if (!code || typeof code !== 'string') {
        res.status(400).json({
          status: 'error',
          message: 'Authorization code is required',
        });
        return;
      }

      // Exchange code for token
      const tokenData = await oauthService.exchangeCodeForToken(code);

      // Get user info from ML
      const userInfo = await oauthService.getUserInfo(tokenData.access_token);

      // Generate local JWT
      const localToken = jwt.sign(
        {
          userId: userInfo.id.toString(),
          email: userInfo.email,
          nickname: userInfo.nickname,
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn as any }
      );

      // Save token to database
      await oauthService.saveToken(userInfo.id.toString(), userInfo.id.toString(), tokenData);

      // Return tokens
      res.json({
        status: 'success',
        data: {
          localToken,
          mlUserId: userInfo.id,
          email: userInfo.email,
          nickname: userInfo.nickname,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh JWT token
   */
  async refreshToken(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({
          status: 'error',
          message: 'User not authenticated',
        });
        return;
      }

      // Check if user has valid ML token
      const hasValidToken = await oauthService.hasValidToken(userId);

      if (!hasValidToken) {
        res.status(401).json({
          status: 'error',
          message: 'ML token expired or not found. Please re-authenticate.',
        });
        return;
      }

      // Generate new JWT
      const newToken = jwt.sign({ userId }, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn as any,
      });

      res.json({
        status: 'success',
        data: {
          token: newToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Revoke token and logout
   */
  async logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({
          status: 'error',
          message: 'User not authenticated',
        });
        return;
      }

      await oauthService.revokeToken(userId);

      res.json({
        status: 'success',
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user status
   */
  async getStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({
          status: 'error',
          message: 'User not authenticated',
        });
        return;
      }

      const hasValidToken = await oauthService.hasValidToken(userId);

      res.json({
        status: 'success',
        data: {
          userId,
          authenticated: hasValidToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const oauthController = new OAuthController();

import { Router, Request, Response, NextFunction } from 'express';
import { oauthController } from '../controllers/OAuthController.js';
import { authMiddleware } from '../middleware/auth.js';

export const oauthRoutes = Router();

/**
 * POST /api/oauth/authorize
 * Initiate OAuth authorization flow
 */
oauthRoutes.post('/authorize', oauthController.initiateAuth);

/**
 * GET /api/oauth/callback
 * OAuth callback handler
 * Query params: code, state
 */
oauthRoutes.get('/callback', oauthController.handleCallback);

/**
 * POST /api/oauth/refresh
 * Refresh JWT token (requires authentication)
 */
oauthRoutes.post('/refresh', authMiddleware as any, oauthController.refreshToken);

/**
 * POST /api/oauth/logout
 * Logout and revoke tokens (requires authentication)
 */
oauthRoutes.post('/logout', authMiddleware as any, oauthController.logout);

/**
 * GET /api/oauth/status
 * Get authentication status (requires authentication)
 */
oauthRoutes.get('/status', authMiddleware as any, oauthController.getStatus);

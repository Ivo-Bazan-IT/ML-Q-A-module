import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

interface DecodedToken {
  userId: string;
  email: string;
  nickname: string;
  iat: number;
  exp: number;
}

interface AuthRequest extends Request {
  userId?: string;
  user?: DecodedToken;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({
        status: 'error',
        message: 'No token provided',
      });
      return;
    }

    const decoded = jwt.verify(token, config.jwt.secret) as DecodedToken;
    req.userId = decoded.userId;
    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        status: 'error',
        message: 'Token expired',
      });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid token',
      });
    } else {
      res.status(401).json({
        status: 'error',
        message: 'Authentication failed',
      });
    }
  }
};

export const optionalAuthMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, config.jwt.secret) as DecodedToken;
      req.userId = decoded.userId;
      req.user = decoded;
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

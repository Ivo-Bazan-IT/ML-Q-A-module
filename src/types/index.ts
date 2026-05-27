import { Request } from 'express';

export interface AuthRequest extends Request {
  userId?: string;
  user?: {
    userId: string;
    email: string;
    nickname: string;
  };
}

export interface APIResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

export interface PaginationParams {
  limit: number;
  offset: number;
  skip: number;
}

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: {
        userId: string;
        email: string;
        nickname: string;
      };
    }
  }
}

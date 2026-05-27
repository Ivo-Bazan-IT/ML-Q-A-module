import { Response, NextFunction } from 'express';
import { qnaService } from '../services/QNAService.js';

interface AuthRequest {
  userId?: string;
  body?: any;
  query?: any;
  params?: any;
}

interface QNARequest extends AuthRequest {
  userId: string;
}

class QNAController {
  /**
   * Get questions for a specific item
   */
  async getItemQuestions(req: QNARequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { itemId } = req.params;
      const { userId } = req;

      if (!itemId) {
        res.status(400).json({
          status: 'error',
          message: 'Item ID is required',
        });
        return;
      }

      const questions = await qnaService.getItemQuestions(userId, itemId);

      res.json({
        status: 'success',
        data: {
          itemId,
          questions,
          count: questions.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all questions for seller
   */
  async getSellerQuestions(req: QNARequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sellerId } = req.params;
      const { limit = 50, offset = 0 } = req.query;
      const { userId } = req;

      if (!sellerId) {
        res.status(400).json({
          status: 'error',
          message: 'Seller ID is required',
        });
        return;
      }

      const questions = await qnaService.getSellerQuestions(
        userId,
        sellerId,
        parseInt(limit as string) || 50,
        parseInt(offset as string) || 0
      );

      res.json({
        status: 'success',
        data: {
          sellerId,
          questions,
          count: questions.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get specific question
   */
  async getQuestion(req: QNARequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { questionId } = req.params;
      const { userId } = req;

      if (!questionId) {
        res.status(400).json({
          status: 'error',
          message: 'Question ID is required',
        });
        return;
      }

      const question = await qnaService.getQuestion(userId, questionId);

      res.json({
        status: 'success',
        data: { question },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Answer a question
   */
  async answerQuestion(req: QNARequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { questionId } = req.params;
      const { text } = req.body;
      const { userId } = req;

      if (!questionId || !text) {
        res.status(400).json({
          status: 'error',
          message: 'Question ID and answer text are required',
        });
        return;
      }

      const answer = await qnaService.answerQuestion(userId, questionId, text);

      res.status(201).json({
        status: 'success',
        data: { answer },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete an answer
   */
  async deleteAnswer(req: QNARequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { answerId } = req.params;
      const { userId } = req;

      if (!answerId) {
        res.status(400).json({
          status: 'error',
          message: 'Answer ID is required',
        });
        return;
      }

      await qnaService.deleteAnswer(userId, answerId);

      res.json({
        status: 'success',
        message: 'Answer deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Sync questions for seller
   */
  async syncSellerQuestions(req: QNARequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sellerId } = req.params;
      const { userId } = req;

      if (!sellerId) {
        res.status(400).json({
          status: 'error',
          message: 'Seller ID is required',
        });
        return;
      }

      const syncedQuestions = await qnaService.syncQuestionsForSeller(userId, sellerId);

      res.json({
        status: 'success',
        data: {
          sellerId,
          syncedCount: syncedQuestions.length,
          questions: syncedQuestions,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get unanswered questions
   */
  async getUnansweredQuestions(req: QNARequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sellerId } = req.params;
      const { limit = 20 } = req.query;

      if (!sellerId) {
        res.status(400).json({
          status: 'error',
          message: 'Seller ID is required',
        });
        return;
      }

      const unansweredQuestions = await qnaService.getUnansweredQuestions(
        sellerId,
        parseInt(limit as string) || 20
      );

      res.json({
        status: 'success',
        data: {
          sellerId,
          unansweredCount: unansweredQuestions.length,
          questions: unansweredQuestions,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get answered questions
   */
  async getAnsweredQuestions(req: QNARequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sellerId } = req.params;
      const { limit = 20, skip = 0 } = req.query;

      if (!sellerId) {
        res.status(400).json({
          status: 'error',
          message: 'Seller ID is required',
        });
        return;
      }

      const answeredQuestions = await qnaService.getAnsweredQuestions(
        sellerId,
        parseInt(limit as string) || 20,
        parseInt(skip as string) || 0
      );

      res.json({
        status: 'success',
        data: {
          sellerId,
          answeredCount: answeredQuestions.length,
          questions: answeredQuestions,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const qnaController = new QNAController();

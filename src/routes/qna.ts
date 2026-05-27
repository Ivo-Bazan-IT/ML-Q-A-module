import { Router } from 'express';
import { qnaController } from '../controllers/QNAController.js';
import { authMiddleware } from '../middleware/auth.js';

export const qnaRoutes = Router();

// Apply auth middleware to all routes
qnaRoutes.use(authMiddleware as any);

/**
 * GET /api/qna/items/:itemId/questions
 * Get questions for a specific item
 */
qnaRoutes.get('/items/:itemId/questions', (req, res, next) => {
  qnaController.getItemQuestions(req as any, res, next);
});

/**
 * GET /api/qna/sellers/:sellerId/questions
 * Get all questions for a seller
 */
qnaRoutes.get('/sellers/:sellerId/questions', (req, res, next) => {
  qnaController.getSellerQuestions(req as any, res, next);
});

/**
 * POST /api/qna/sellers/:sellerId/sync
 * Sync questions from Mercado Libre for a seller
 */
qnaRoutes.post('/sellers/:sellerId/sync', (req, res, next) => {
  qnaController.syncSellerQuestions(req as any, res, next);
});

/**
 * GET /api/qna/sellers/:sellerId/unanswered
 * Get unanswered questions for a seller
 */
qnaRoutes.get('/sellers/:sellerId/unanswered', (req, res, next) => {
  qnaController.getUnansweredQuestions(req as any, res, next);
});

/**
 * GET /api/qna/sellers/:sellerId/answered
 * Get answered questions for a seller
 */
qnaRoutes.get('/sellers/:sellerId/answered', (req, res, next) => {
  qnaController.getAnsweredQuestions(req as any, res, next);
});

/**
 * GET /api/qna/questions/:questionId
 * Get specific question details
 */
qnaRoutes.get('/questions/:questionId', (req, res, next) => {
  qnaController.getQuestion(req as any, res, next);
});

/**
 * POST /api/qna/questions/:questionId/answer
 * Answer a question
 * Body: { text: string }
 */
qnaRoutes.post('/questions/:questionId/answer', (req, res, next) => {
  qnaController.answerQuestion(req as any, res, next);
});

/**
 * DELETE /api/qna/answers/:answerId
 * Delete an answer
 */
qnaRoutes.delete('/answers/:answerId', (req, res, next) => {
  qnaController.deleteAnswer(req as any, res, next);
});

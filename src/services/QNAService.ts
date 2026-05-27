import axios, { AxiosError } from 'axios';
import { config } from '../config/index.js';
import { oauthService } from './OAuthService.js';
import { Question, Answer, IQuestion, IAnswer } from '../models/QNA.js';

interface MLQuestion {
  id: string;
  item: { id: string };
  seller: { id: number };
  buyer: { id: number };
  text: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'BANNED';
  date_created: string;
}

interface MLAnswer {
  id: string;
  question_id: string;
  seller: { id: number };
  text: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'BANNED';
  date_created: string;
}

class QNAService {
  /**
   * Get questions for a specific item
   */
  async getItemQuestions(userId: string, itemId: string): Promise<MLQuestion[]> {
    try {
      const accessToken = await oauthService.getValidAccessToken(userId);

      const response = await axios.get<{ questions: MLQuestion[] }>(
        `${config.mercadoLibre.apiBaseUrl}/items/${itemId}/questions`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response.data.questions || [];
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(`Error fetching questions for item ${itemId}:`, axiosError.response?.data);
      throw new Error(`Failed to get questions: ${axiosError.message}`);
    }
  }

  /**
   * Get all questions for a seller
   */
  async getSellerQuestions(
    userId: string,
    sellerId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<MLQuestion[]> {
    try {
      const accessToken = await oauthService.getValidAccessToken(userId);

      const response = await axios.get<{ questions: MLQuestion[] }>(
        `${config.mercadoLibre.apiBaseUrl}/sellers/${sellerId}/questions`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            limit,
            offset,
          },
        }
      );

      return response.data.questions || [];
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(`Error fetching questions for seller ${sellerId}:`, axiosError.response?.data);
      throw new Error(`Failed to get seller questions: ${axiosError.message}`);
    }
  }

  /**
   * Get specific question details
   */
  async getQuestion(userId: string, questionId: string): Promise<MLQuestion> {
    try {
      const accessToken = await oauthService.getValidAccessToken(userId);

      const response = await axios.get<MLQuestion>(
        `${config.mercadoLibre.apiBaseUrl}/questions/${questionId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(`Error fetching question ${questionId}:`, axiosError.response?.data);
      throw new Error(`Failed to get question: ${axiosError.message}`);
    }
  }

  /**
   * Answer a question
   */
  async answerQuestion(userId: string, questionId: string, answerText: string): Promise<MLAnswer> {
    try {
      const accessToken = await oauthService.getValidAccessToken(userId);

      const response = await axios.post<MLAnswer>(
        `${config.mercadoLibre.apiBaseUrl}/answers`,
        {
          question_id: questionId,
          text: answerText,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(`Error answering question ${questionId}:`, axiosError.response?.data);
      throw new Error(`Failed to answer question: ${axiosError.message}`);
    }
  }

  /**
   * Delete an answer
   */
  async deleteAnswer(userId: string, answerId: string): Promise<void> {
    try {
      const accessToken = await oauthService.getValidAccessToken(userId);

      await axios.delete(`${config.mercadoLibre.apiBaseUrl}/answers/${answerId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(`Error deleting answer ${answerId}:`, axiosError.response?.data);
      throw new Error(`Failed to delete answer: ${axiosError.message}`);
    }
  }

  /**
   * Sync questions from ML to local database
   */
  async syncQuestionsForSeller(userId: string, mlSellerId: string): Promise<IQuestion[]> {
    try {
      const mlQuestions = await this.getSellerQuestions(userId, mlSellerId, 100, 0);

      const syncedQuestions: IQuestion[] = [];

      for (const mlQuestion of mlQuestions) {
        const question = await Question.findOneAndUpdate(
          { mlQuestionId: mlQuestion.id },
          {
            mlQuestionId: mlQuestion.id,
            mlItemId: mlQuestion.item.id,
            mlSellerId: mlQuestion.seller.id.toString(),
            mlBuyerId: mlQuestion.buyer.id.toString(),
            text: mlQuestion.text,
            status: mlQuestion.status.toLowerCase() as any,
            syncedAt: new Date(),
          },
          { upsert: true, new: true }
        );

        syncedQuestions.push(question);
      }

      console.log(`Synced ${syncedQuestions.length} questions for seller ${mlSellerId}`);
      return syncedQuestions;
    } catch (error) {
      console.error(`Error syncing questions for seller ${mlSellerId}:`, error);
      throw error;
    }
  }

  /**
   * Get unanswered questions from local database
   */
  async getUnansweredQuestions(
    mlSellerId: string,
    limit: number = 20
  ): Promise<
    Array<{
      question: IQuestion;
      answers: IAnswer[];
    }>
  > {
    const questions = await Question.find({
      mlSellerId,
      status: 'active',
      deletedAt: null,
    })
      .limit(limit)
      .sort({ createdAt: -1 });

    const result = [];

    for (const question of questions) {
      const answers = await Answer.find({
        mlQuestionId: question.mlQuestionId,
        status: 'active',
        deletedAt: null,
      });

      // Only include questions without answers
      if (answers.length === 0) {
        result.push({
          question,
          answers,
        });
      }
    }

    return result;
  }

  /**
   * Get answered questions from local database
   */
  async getAnsweredQuestions(
    mlSellerId: string,
    limit: number = 20,
    skip: number = 0
  ): Promise<
    Array<{
      question: IQuestion;
      answers: IAnswer[];
    }>
  > {
    const questions = await Question.find({
      mlSellerId,
      status: 'active',
      deletedAt: null,
    })
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const result = [];

    for (const question of questions) {
      const answers = await Answer.find({
        mlQuestionId: question.mlQuestionId,
        status: 'active',
        deletedAt: null,
      });

      if (answers.length > 0) {
        result.push({
          question,
          answers,
        });
      }
    }

    return result;
  }

  /**
   * Get complete item details with questions
   */
  async getItemDetailsWithQuestions(userId: string, itemId: string) {
    try {
      const accessToken = await oauthService.getValidAccessToken(userId);

      const itemDetails = await axios.get(`${config.mercadoLibre.apiBaseUrl}/items/${itemId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const questions = await this.getItemQuestions(userId, itemId);

      return {
        ...itemDetails.data,
        questions,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(`Error fetching item details ${itemId}:`, axiosError.response?.data);
      throw new Error(`Failed to get item details: ${axiosError.message}`);
    }
  }
}

export const qnaService = new QNAService();

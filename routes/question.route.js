import express from 'express';
import { checkRole, protectRoute } from '../middleware/auth.middleware.js';
import {
  createNewQuestionController,
  getScheduledQuizQuestionsController,
} from '../controllers/question.controller.js';
import { handleLambdaCallbackController } from '../controllers/quiz.controller.js';

export const questionRouter = express.Router();

questionRouter.post(
  '/',
  protectRoute,
  checkRole('Employee'),
  createNewQuestionController,
);

questionRouter.get(
  '/scheduled/quiz/:quizId',
  protectRoute,
  checkRole('Admin'),
  getScheduledQuizQuestionsController,
);

questionRouter.post('/new/HRD', handleLambdaCallbackController);
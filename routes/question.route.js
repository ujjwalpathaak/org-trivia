import express from 'express';
import { checkRole, protectRoute } from '../middleware/auth.middleware.js';
import {
  createNewQuestionController,
  editQuizQuestionsController,
  getScheduledQuizQuestionsController,
  handleLambdaCallbackController,
} from '../controllers/question.controller.js';

export const questionRouter = express.Router();

questionRouter.post(
  '/',
  protectRoute,
  checkRole('Employee'),
  createNewQuestionController,
);

questionRouter.patch(
  '/quiz',
  protectRoute,
  checkRole('Admin'),
  editQuizQuestionsController,
);


questionRouter.get(
  '/scheduled/quiz/:quizId',
  protectRoute,
  checkRole('Admin'),
  getScheduledQuizQuestionsController,
);

questionRouter.post('/new/HRD', handleLambdaCallbackController);
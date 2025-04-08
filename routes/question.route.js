import express from 'express';

import {
  addNewHRPQuestionsCallbackController,
  createNewQuestionController,
  editQuizQuestionsController,
  getScheduledQuizQuestionsController,
} from '../controllers/question.controller.js';
import { checkRole, protectRoute } from '../middleware/auth.middleware.js';

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
import express from 'express';

import {
  approveWeeklyQuizQuestionsController,
  cancelLiveQuizController,
  getScheduledQuizzesController,
  getWeeklyQuizLiveQuestionsController,
  getWeeklyQuizStatusController,
  handleLambdaCallbackController,
} from '../controllers/quiz.controller.js';
import { checkRole, protectRoute } from '../middleware/auth.middleware.js';

export const quizRouter = express.Router();

quizRouter.get(
  '/status',
  protectRoute,
  checkRole('Employee'),
  getWeeklyQuizStatusController,
);

quizRouter.post('/weekly/lambda/callback', handleLambdaCallbackController);

quizRouter.put(
  '/live/cancel/:quizId',
  protectRoute,
  checkRole('Admin'),
  cancelLiveQuizController,
);

quizRouter.post(
  '/approve',
  protectRoute,
  checkRole('Admin'),
  approveWeeklyQuizQuestionsController,
);

quizRouter.get(
  '/scheduled',
  protectRoute,
  checkRole('Admin'),
  getScheduledQuizzesController,
);

quizRouter.get(
  '/questions',
  protectRoute,
  checkRole('Employee'),
  getWeeklyQuizLiveQuestionsController,
);

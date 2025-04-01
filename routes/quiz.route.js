import express from 'express';

import { getWeeklyQuizStatusController, handleLambdaCallback, cancelLiveQuizController, approveWeeklyQuizQuestions, getScheduledQuizzes, getWeeklyQuizQuestions } from '../controllers/quiz.controller.js';
import { checkRole, protectRoute } from '../middleware/auth.middleware.js';

export const quizRouter = express.Router();

quizRouter.get(
  '/status',
  protectRoute,
  checkRole('Employee'),
  getWeeklyQuizStatusController,
);

quizRouter.post('/weekly/lambda/callback', handleLambdaCallback);

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
  approveWeeklyQuizQuestions,
);

quizRouter.get(
  '/scheduled',
  protectRoute,
  checkRole('Admin'),
  getScheduledQuizzes,
);

quizRouter.get(
  '/questions',
  protectRoute,
  checkRole('Employee'),
  getWeeklyQuizQuestions,
);

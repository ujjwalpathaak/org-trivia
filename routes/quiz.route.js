import express from 'express';

import {
  cancelLiveQuizController,
  editWeeklyQuizQuestionsController,
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

quizRouter.get(
  '/live/cancel',
  protectRoute,
  checkRole('Admin'),
  cancelLiveQuizController,
);

quizRouter.post(
  '/questions/edit',
  protectRoute,
  checkRole('Admin'),
  editWeeklyQuizQuestionsController,
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

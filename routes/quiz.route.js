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
import { submitWeeklyQuizAnswersController } from '../controllers/result.controller.js';

export const quizRouter = express.Router();

quizRouter.get(
  '/status',
  protectRoute,
  checkRole('Employee'),
  getWeeklyQuizStatusController,
);

quizRouter.post('/weekly/lambda/callback', handleLambdaCallbackController);

quizRouter.patch(
  '/:quizId/cancel',
  protectRoute,
  checkRole('Admin'),
  cancelLiveQuizController,
);

quizRouter.patch(
  '/questions',
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
  '/submit',
  protectRoute,
  checkRole('Admin'),
  submitWeeklyQuizAnswersController,
);

quizRouter.get(
  '/live/questions',
  protectRoute,
  checkRole('Employee'),
  getWeeklyQuizLiveQuestionsController,
);

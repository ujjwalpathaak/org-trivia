import express from 'express';

import {
  allowScheduledQuizController,
  cancelLiveQuizController,
  cancelScheduledQuizController,
  getQuizStatusController,
  getScheduledQuizzesController,
  getWeeklyQuizLiveQuestionsController,
  submitQuizAnswersController,
} from '../controllers/quiz.controller.js';
import { checkRole, protectRoute } from '../middleware/auth.middleware.js';

export const quizRouter = express.Router();

quizRouter.get(
  '/status',
  protectRoute,
  checkRole('Employee'),
  getQuizStatusController,
);

quizRouter.patch(
  '/live/:quizId/cancel',
  protectRoute,
  checkRole('Admin'),
  cancelLiveQuizController,
);

quizRouter.patch(
  '/scheduled/:quizId/cancel',
  protectRoute,
  checkRole('Admin'),
  cancelScheduledQuizController,
);

quizRouter.patch(
  '/scheduled/:quizId/allow',
  protectRoute,
  checkRole('Admin'),
  allowScheduledQuizController,
);

quizRouter.get(
  '/scheduled',
  protectRoute,
  checkRole('Admin'),
  getScheduledQuizzesController,
);

quizRouter.post(
  '/submit',
  protectRoute,
  checkRole('Employee'),
  submitQuizAnswersController,
);

quizRouter.get(
  '/live/questions',
  protectRoute,
  checkRole('Employee'),
  getWeeklyQuizLiveQuestionsController,
);

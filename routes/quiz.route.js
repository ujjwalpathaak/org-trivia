import express from 'express';

import {
  cancelQuizController,
  getQuizStatusController,
  getScheduledQuizzesController,
  getWeeklyQuizLiveQuestionsController,
  restoreQuizController,
  resumeLiveQuizController,
  submitQuizAnswersController,
  suspendLiveQuizController,
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
  '/live/:quizId/suspend',
  protectRoute,
  checkRole('Admin'),
  suspendLiveQuizController,
);

quizRouter.patch(
  '/:quizId/cancel',
  protectRoute,
  checkRole('Admin'),
  cancelQuizController,
);

quizRouter.patch(
  '/:quizId/restore',
  protectRoute,
  checkRole('Admin'),
  restoreQuizController,
);

quizRouter.patch(
  '/live/:quizId/resume',
  protectRoute,
  checkRole('Admin'),
  resumeLiveQuizController,
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

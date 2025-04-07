import express from 'express';

import {
  cancelLiveQuizController,
  editQuizQuestionsController,
  getScheduledQuizzesController,
  getWeeklyQuizLiveQuestionsController,
  getQuizStatusController,
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
  '/:quizId/cancel',
  protectRoute,
  checkRole('Admin'),
  cancelLiveQuizController,
);

quizRouter.patch(
  '/questions',
  protectRoute,
  checkRole('Admin'),
  editQuizQuestionsController,
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
  submitQuizAnswersController,
);

quizRouter.get(
  '/live/questions',
  protectRoute,
  checkRole('Employee'),
  getWeeklyQuizLiveQuestionsController,
);

import express from 'express';

import QuizController from '../controllers/quiz.controller.js';
import { checkRole, protectRoute } from '../middleware/auth.middleware.js';

const quizRouter = express.Router();

quizRouter.get(
  '/status',
  protectRoute,
  checkRole('Employee'),
  QuizController.getWeeklyQuizStatusController,
);

quizRouter.post('/weekly/lambda/callback', QuizController.handleLambdaCallback);

quizRouter.put(
  '/live/cancel/:quizId',
  protectRoute,
  checkRole('Admin'),
  QuizController.cancelLiveQuizController,
);

quizRouter.post(
  '/approve',
  protectRoute,
  checkRole('Admin'),
  QuizController.approveWeeklyQuizQuestions,
);

quizRouter.get(
  '/scheduled',
  protectRoute,
  checkRole('Admin'),
  QuizController.getScheduledQuizzes,
);

quizRouter.get(
  '/questions',
  protectRoute,
  checkRole('Employee'),
  QuizController.getWeeklyQuizQuestions,
);

export default quizRouter;

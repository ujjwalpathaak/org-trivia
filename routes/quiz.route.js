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

quizRouter.post(
  '/approve',
  protectRoute,
  checkRole('Admin'),
  QuizController.approveWeeklyQuizQuestions,
);

quizRouter.get(
  '/questions',
  protectRoute,
  checkRole('Employee'),
  QuizController.getWeeklyQuizQuestions,
);

export default quizRouter;

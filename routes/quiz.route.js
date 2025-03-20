import express from 'express';

import QuizController from '../controllers/quiz.controller.js';
import { checkRole, protectRoute } from '../middleware/auth.middleware.js';

const quizRouter = express.Router();

quizRouter.get(
  '/status/:orgId/:employeeId',
  protectRoute,
  checkRole('Employee'),
  QuizController.getWeeklyQuizStatus,
);

quizRouter.post('/weekly/lambda/callback', QuizController.handleLambdaCallback);

quizRouter.post(
  '/approve/:orgId',
  protectRoute,
  checkRole('Admin'),
  QuizController.approveWeeklyQuizQuestions,
);

quizRouter.get(
  '/questions/:orgId',
  protectRoute,
  checkRole('Employee'),
  QuizController.getWeeklyQuizQuestions,
);

export default quizRouter;

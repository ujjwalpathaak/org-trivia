import express from 'express';

import QuizController from '../controllers/quiz.controller.js';
import { checkRole, protectRoute } from '../middleware/auth.middleware.js';

const quizController = new QuizController();
const quizRouter = express.Router();

quizRouter.get(
  '/status/:orgId/:employeeId',
  protectRoute,
  checkRole('Employee'),
  quizController.getWeeklyQuizStatus,
);

quizRouter.post('/weekly/lambda/callback', quizController.handleLambdaCallback);

quizRouter.post(
  '/approve/:orgId',
  protectRoute,
  checkRole('Admin'),
  quizController.approveWeeklyQuizQuestions,
);

quizRouter.get(
  '/questions/:orgId',
  protectRoute,
  checkRole('Employee'),
  quizController.getWeeklyQuizQuestions,
);

export default quizRouter;

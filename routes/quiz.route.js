import express from 'express';
import { checkRole, protectRoute } from '../middleware/auth.middleware.js';

import QuizController from '../controllers/quiz.controller.js';

const quizController = new QuizController();
const quizRouter = express.Router();

quizRouter.get('/status/:orgId/:employeeId', quizController.isWeeklyQuizLive);

quizRouter.post('/weekly/lambda/callback', quizController.handleLambdaCallback);

quizRouter.post('/new/:orgId', quizController.scheduleNewQuiz);

quizRouter.post('/approve/:orgId', quizController.approveWeeklyQuizQuestions);

quizRouter.get(
  '/questions/:orgId',
  protectRoute,
  checkRole('Employee'),
  quizController.getWeeklyQuizQuestions,
);

export default quizRouter;

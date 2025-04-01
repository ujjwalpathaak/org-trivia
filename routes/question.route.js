import express from 'express';
const questionRouter = express.Router();
import questionController from '../controllers/question.controller.js';
import { checkRole, protectRoute } from '../middleware/auth.middleware.js';

questionRouter.post(
  '/',
  protectRoute,
  checkRole('Employee'),
  questionController.addQuestionController,
);

questionRouter.get(
  '/weekly-quiz/:quizId',
  protectRoute,
  checkRole('Admin'),
  questionController.getWeeklyQuizQuestionsController,
);

questionRouter.get(
  '/test/scheduleQuizzesJob',
  questionController.scheduleQuizzesJobController,
);

export default questionRouter;

import express from 'express';
import { checkRole, protectRoute } from '../middleware/auth.middleware.js';
import { addQuestionController, getWeeklyQuizQuestionsController, scheduleQuizzesJobController } from '../controllers/question.controller.js';

export const questionRouter = express.Router();

questionRouter.post(
  '/',
  protectRoute,
  checkRole('Employee'),
  addQuestionController,
);

questionRouter.get(
  '/weekly-quiz/:quizId',
  protectRoute,
  checkRole('Admin'),
  getWeeklyQuizQuestionsController,
);

questionRouter.get(
  '/test/scheduleQuizzesJob',
  scheduleQuizzesJobController,
);

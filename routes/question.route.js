import express from 'express';

import {
  addQuestionController,
  getWeeklyQuizQuestionsController,
} from '../controllers/question.controller.js';
import { checkRole, protectRoute } from '../middleware/auth.middleware.js';
import { scheduleQuizzesJob } from '../services/question.service.js';

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

questionRouter.get('/test/scheduleQuizzesJob', scheduleQuizzesJob);

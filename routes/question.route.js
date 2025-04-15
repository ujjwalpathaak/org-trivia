import express from 'express';

import {
  approveEmployeeQuestionsController,
  createNewQuestionController,
  deleteQuestionController,
  editQuizQuestionsController,
  getEmployeeQuestionsToApproveController,
  getScheduledQuizQuestionsController,
  rejectEmployeeQuestionsController,
} from '../controllers/question.controller.js';
import { checkRole, protectRoute } from '../middleware/auth.middleware.js';

export const questionRouter = express.Router();

questionRouter.post(
  '/',
  protectRoute,
  checkRole('Employee'),
  createNewQuestionController,
);

questionRouter.patch(
  '/quiz',
  protectRoute,
  checkRole('Admin'),
  editQuizQuestionsController,
);

questionRouter.delete(
  '/delete',
  protectRoute,
  checkRole('Admin'),
  deleteQuestionController,
);

questionRouter.get(
  '/scheduled/quiz/:quizId',
  protectRoute,
  checkRole('Admin'),
  getScheduledQuizQuestionsController,
);

questionRouter.get(
  '/employees/approve',
  protectRoute,
  checkRole('Admin'),
  getEmployeeQuestionsToApproveController,
);

questionRouter.patch(
  '/employees/approve',
  protectRoute,
  checkRole('Admin'),
  approveEmployeeQuestionsController,
);

questionRouter.patch(
  '/employees/reject',
  protectRoute,
  checkRole('Admin'),
  rejectEmployeeQuestionsController,
);

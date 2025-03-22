import express from 'express';
const questionRouter = express.Router();
import questionController from '../controllers/question.controller.js';
import { checkRole, protectRoute } from '../middleware/auth.middleware.js';

questionRouter.post(
  '/',
  protectRoute,
  checkRole('Employee'),
  questionController.addQuestion,
);

questionRouter.get(
  '/weekly/unapproved/:orgId',
  protectRoute,
  checkRole('Admin'),
  questionController.getWeeklyUnapprovedQuestions,
);

questionRouter.get(
  '/test/scheduleNextWeekQuestionsApproval',
  questionController.testScheduleNextWeekQuestionsApproval,
);

export default questionRouter;

import express from 'express';

import QuestionController from '../controllers/question.controller.js';
import { checkRole, protectRoute } from '../middleware/auth.middleware.js';

const questionController = new QuestionController();
const questionRouter = express.Router();

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

// questionRouter.post('/new/HRdocs', questionController.saveHRdocQuestions);

questionRouter.get(
  '/test/scheduleNextWeekQuestionsApproval',
  questionController.testScheduleNextWeekQuestionsApproval,
);

export default questionRouter;

import express from 'express';
import { checkRole, protectRoute } from '../middleware/auth.middleware.js';
import QuestionController from '../controllers/question.controller.js';

const questionController = new QuestionController();
const questionRouter = express.Router();

questionRouter.post('/', protectRoute, questionController.addQuestion);

questionRouter.get(
  '/weekly/unapproved/:orgId',
  protectRoute,
  checkRole('Admin'),
  questionController.getWeeklyUnapprovedQuestions,
);

questionRouter.post('/new/HRdocs', questionController.saveHRdocQuestions);

questionRouter.get(
  '/test/scheduleNextWeekQuestionsApproval',
  questionController.testScheduleNextWeekQuestionsApproval,
);

export default questionRouter;

import express from 'express';
import { checkRole, protectRoute } from '../middleware/auth.middleware.js';
import QuestionController from '../controllers/question.controller.js';

const questionController = new QuestionController();
const questionRouter = express.Router();

questionRouter.post('/', protectRoute, questionController.addQuestions);

questionRouter.get(
  '/weekly/unapproved/:orgId',
  protectRoute,
  checkRole('Admin'),
  questionController.getWeeklyUnapprovedQuestions,
);
// how to limit this API call to only lambda funcitions - will see later
questionRouter.post(
  '/weekly/lambda/callback',
  questionController.handleLambdaCallback,
);

export default questionRouter;

import express from 'express';
import {
  addQuestions,
  getWeeklyUnapprovedQuestions,
  handleLambdaCallback,
} from '../controllers/question.controller.js';
import { checkRole, protectRoute } from '../middleware/auth.middleware.js';

const questionRouter = express.Router();

questionRouter.post('/', protectRoute, addQuestions);

questionRouter.get(
  '/weekly/unapproved/:orgId',
  protectRoute,
  checkRole('Admin'),
  getWeeklyUnapprovedQuestions,
);
// how to limit this API call to only lambda funcitions - will see later
questionRouter.post('/weekly/lambda/callback', handleLambdaCallback);

export default questionRouter;

import express from 'express';

import {
  getEmployeePastResultsController,
  submitWeeklyQuizAnswersController,
} from '../controllers/result.controller.js';

export const resultRouter = express.Router();

resultRouter.post(
  '/submitWeeklyQuizAnswers',
  submitWeeklyQuizAnswersController,
);

resultRouter.get('/employee', getEmployeePastResultsController);

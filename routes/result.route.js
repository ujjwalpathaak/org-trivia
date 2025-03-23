import express from 'express';

import ResultController from '../controllers/result.controller.js';

const resultRouter = express.Router();

resultRouter.post(
  '/submitWeeklyQuizAnswers',
  ResultController.submitWeeklyQuizAnswersController,
);
resultRouter.get('/employee', ResultController.getEmployeePastResults);

export default resultRouter;

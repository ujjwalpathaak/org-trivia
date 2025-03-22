import express from 'express';

import ResultController from '../controllers/result.controller.js';

const resultRouter = express.Router();

resultRouter.post(
  '/submitWeeklyQuizAnswers',
  ResultController.submitWeeklyQuizAnswers,
);
resultRouter.get(
  '/employee/:employeeId',
  ResultController.getEmployeePastResults,
);

export default resultRouter;

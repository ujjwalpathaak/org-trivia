import express from 'express';

import ResultController from '../controllers/result.controller.js';

const resultController = new ResultController();
const resultRouter = express.Router();

resultRouter.post(
  '/submitWeeklyQuizAnswers',
  resultController.submitWeeklyQuizAnswers,
);
//
resultRouter.get(
  '/employee/:employeeId',
  resultController.getEmployeePastResults,
);

export default resultRouter;

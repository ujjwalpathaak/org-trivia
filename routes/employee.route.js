import express from 'express';

import employeeController from '../controllers/employee.controller.js';
import { checkRole } from '../middleware/auth.middleware.js';

const employeeRouter = express.Router();

employeeRouter.get(
  '/',
  checkRole('Employee'),
  employeeController.getEmployeeDetails,
);
employeeRouter.get(
  '/quizzes/results',
  checkRole('Employee'),
  employeeController.getPastQuizResultsController,
);
employeeRouter.get(
  '/submitted-questions',
  checkRole('Employee'),
  employeeController.getSubmittedQuestionsController,
);

export default employeeRouter;

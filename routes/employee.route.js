import express from 'express';

import employeeController from '../controllers/employee.controller.js';
import { checkRole } from '../middleware/auth.middleware.js';

const employeeRouter = express.Router();

employeeRouter.get(
  '/score/:employeeId',
  checkRole('Employee'),
  employeeController.fetchEmployeeScoreController,
);
employeeRouter.get(
  '/:employeeId',
  checkRole('Employee'),
  employeeController.getEmployeeDetails,
);
employeeRouter.get(
  '/quizzes/results/:employeeId',
  checkRole('Employee'),
  employeeController.getPastQuizResultsController,
);
employeeRouter.get(
  '/submitted-questions/:employeeId',
  checkRole('Employee'),
  employeeController.getSubmittedQuestionsController,
);

export default employeeRouter;

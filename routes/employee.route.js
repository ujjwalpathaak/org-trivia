import express from 'express';
import {
  getEmployeeDetailsController,
  getEmployeePastResultsController,
  getEmployeeSubmittedQuestionsController,
} from '../controllers/employee.controller.js';
import { checkRole } from '../middleware/auth.middleware.js';

export const employeeRouter = express.Router();

employeeRouter.get('/', checkRole('Employee'), getEmployeeDetailsController);

employeeRouter.get('/results/past', checkRole('Employee'), getEmployeePastResultsController);

employeeRouter.get(
  '/questions/submitted',
  checkRole('Employee'),
  getEmployeeSubmittedQuestionsController,
);

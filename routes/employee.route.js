import express from 'express';

import { getEmployeeDetailsController, getSubmittedQuestionsController } from '../controllers/employee.controller.js';
import { checkRole } from '../middleware/auth.middleware.js';

export const employeeRouter = express.Router();

employeeRouter.get(
  '/',
  checkRole('Employee'),
  getEmployeeDetailsController,
);
employeeRouter.get(
  '/submitted-questions',
  checkRole('Employee'),
  getSubmittedQuestionsController,
);

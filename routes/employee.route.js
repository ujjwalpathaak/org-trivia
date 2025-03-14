import express from 'express';
import EmployeeController from '../controllers/employee.controller.js';
import { checkRole } from '../middleware/auth.middleware.js';

const employeeController = new EmployeeController();
const employeeRouter = express.Router();

employeeRouter.get(
  '/org/:orgId',
  checkRole('Admin'),
  employeeController.getAllOrgEmployeesByOrgId,
);
employeeRouter.get(
  '/score/:employeeId',
  checkRole('Employee'),
  employeeController.fetchEmployeeScore,
);
employeeRouter.get(
  '/:employeeId',
  checkRole('Employee'),
  employeeController.getEmployeeDetails,
);
employeeRouter.get(
  '/quizzes/results/:employeeId',
  checkRole('Employee'),
  employeeController.getPastQuizResults,
);

export default employeeRouter;

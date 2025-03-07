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
employeeRouter.get('/score/:employeeId', employeeController.fetchEmployeeScore);

export default employeeRouter;

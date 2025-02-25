import express from 'express';
import EmployeeController from '../controllers/employee.controller.js';

const employeeController = new EmployeeController();
const employeeRouter = express.Router();

employeeRouter.get('/org/:orgId', employeeController.getAllOrgEmployeesByOrgId);

export default employeeRouter;

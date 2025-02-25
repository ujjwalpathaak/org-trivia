import express from 'express';
import {
  getAllEmployeesByOrg,
} from '../controllers/employee.controller.js';

const employeeRouter = express.Router();

employeeRouter.get('/org/:orgId', getAllEmployeesByOrg);

export default employeeRouter;

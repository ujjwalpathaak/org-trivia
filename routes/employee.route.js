import express from "express";
import { getAllEmployees, getAllEmployeesByOrg, getEmployeeByEmail } from "../controllers/employee.controller.js";
import { checkRole, protectRoute } from "../middleware/auth.middleware.js";

const employeeRouter = express.Router();

employeeRouter.get("/", getAllEmployees);
employeeRouter.get("/org/:orgId", getAllEmployeesByOrg);
employeeRouter.get("/:email", getEmployeeByEmail);

export default employeeRouter;
import express from "express";
import { getAllEmployees, getEmployeeByEmail } from "../controllers/employee.controller.js";
import { checkRole, protectRoute } from "../middleware/auth.middleware.js";

const employeeRouter = express.Router();

employeeRouter.get("/", getAllEmployees);
employeeRouter.get("/:email", getEmployeeByEmail);

export default employeeRouter;
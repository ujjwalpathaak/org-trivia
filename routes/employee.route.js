import express from "express";
import { getAllEmployees, getEmployeeByEmail } from "../controllers/employee.controller.js";
import { checkRole, protectRoute } from "../middleware/auth.middleware.js";

const employeeRouter = express.Router();

employeeRouter.get("/", protectRoute, checkRole("Admin"), getAllEmployees);
employeeRouter.get("/:email", protectRoute, checkRole("Admin"), getEmployeeByEmail);

export default employeeRouter;
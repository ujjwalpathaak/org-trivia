import express from "express";
import { getAdminByEmail, getAllAdmins } from "../controllers/admin.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const adminRouter = express.Router();

adminRouter.get("/", protectRoute, getAllAdmins);
adminRouter.get("/:email", protectRoute, getAdminByEmail);

export default adminRouter;
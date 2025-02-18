import express from "express";

import authRouter from "./auth.route.js";
import adminRouter from "./admin.route.js";
import employeeRouter from "./employee.route.js";
import { checkRole, protectRoute } from "../middleware/auth.middleware.js";
import orgRouter from "./org.route.js";

const router = express.Router();

router.get("/", (req, res) => res.send("API Working"));

router.use("/auth", authRouter);
router.use("/admin", protectRoute, adminRouter);
router.use("/employee", protectRoute, checkRole("Admin"), employeeRouter);
router.use("/org", orgRouter);


export default router;
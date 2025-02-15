import express from "express";

import authRouter from "./auth.route.js";
import adminRouter from "./admin.route.js";
import employeeRouter from "./employee.route.js";

const router = express.Router();

router.get("/", (req, res) => res.send("API Working"));

router.use("/auth", authRouter);
router.use("/admin", adminRouter);
router.use("/employee", employeeRouter);


export default router;
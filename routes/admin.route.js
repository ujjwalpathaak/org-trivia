import express from "express";
import { getAdminByEmail, getAllAdmins } from "../controllers/admin.controller.js";

const adminRouter = express.Router();

adminRouter.get("/", getAllAdmins);
adminRouter.get("/:email", getAdminByEmail);

export default adminRouter;
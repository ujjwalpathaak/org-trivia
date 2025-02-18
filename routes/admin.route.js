import express from "express";
import { getAdminByEmail, getAllAdmins, getAllAdminsByOrg } from "../controllers/admin.controller.js";

const adminRouter = express.Router();

adminRouter.get("/", getAllAdmins);
adminRouter.get("/org/:orgId", getAllAdminsByOrg);
adminRouter.get("/:email", getAdminByEmail);

export default adminRouter;
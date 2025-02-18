import express from "express";
import { getAllOrgs, getOrgByName } from "../controllers/org.controller.js";

const orgRouter = express.Router();

orgRouter.get("/", getAllOrgs);
orgRouter.get("/:orgName", getOrgByName);

export default orgRouter;
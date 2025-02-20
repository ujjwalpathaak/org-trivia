import express from "express";
import { getAllOrgs, getOrgById, getOrgQuestions, getOrgQuestionsByGenre } from "../controllers/org.controller.js";

const orgRouter = express.Router();

orgRouter.get("/", getAllOrgs);
orgRouter.get("/:orgId", getOrgById);
orgRouter.get("/:orgId/questions", getOrgQuestions);
orgRouter.get("/:orgId/questions/genre/:genreName", getOrgQuestionsByGenre);

export default orgRouter;
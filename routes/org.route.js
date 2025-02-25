import express from "express";
import { getAllOrgs, getOrgById, getOrgQuestions, getOrgQuestionsByGenre } from "../controllers/org.controller.js";

const orgRouter = express.Router();

orgRouter.get("/", getAllOrgs);

export default orgRouter;
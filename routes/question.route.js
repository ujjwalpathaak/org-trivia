import express from "express";
import { addQuestions, getAllQuestions, getQuestionByGenreName, getQuestionById, getWeeklyUnapprovedQuestions, handleLambdaCallback } from "../controllers/question.controller.js";

const questionRouter = express.Router();

questionRouter.post("/", addQuestions);
questionRouter.get("/", getAllQuestions);
questionRouter.get("/:questionId", getQuestionById);
questionRouter.get("/genre/:genreName", getQuestionByGenreName);

questionRouter.get("/weekly/unapproved/:orgId", getWeeklyUnapprovedQuestions);
questionRouter.post("/weekly/lambda/callback", handleLambdaCallback);

export default questionRouter;
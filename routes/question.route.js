import express from "express";
import { addQuestions, getAllQuestions, getQuestionByGenreName, getQuestionById, handleLambdaCallback } from "../controllers/question.controller.js";

const questionRouter = express.Router();

questionRouter.post("/", addQuestions);
questionRouter.get("/", getAllQuestions);
questionRouter.get("/:questionId", getQuestionById);
questionRouter.get("/genre/:genreName", getQuestionByGenreName);

questionRouter.post("/weekly/lambda/callback", handleLambdaCallback);

export default questionRouter;
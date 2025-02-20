import express from "express";
import { addQuestions, getAllQuestions, getQuestionByGenreName, getQuestionById } from "../controllers/question.controller.js";

const questionRouter = express.Router();

questionRouter.post("/", addQuestions);
questionRouter.get("/", getAllQuestions);
questionRouter.get("/:questionId", getQuestionById);
questionRouter.get("/genre/:genreName", getQuestionByGenreName);

export default questionRouter;
import express from 'express';

import QuizController from '../controllers/quiz.controller.js';

const quizController = new QuizController();
const quizRouter = express.Router();

quizRouter.post(
    '/weekly/lambda/callback',
    quizController.handleLambdaCallback,
  );

export default quizRouter;

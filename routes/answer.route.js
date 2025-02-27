import express from 'express';

import AnswerController from '../controllers/answer.controller.js';

const answerController = new AnswerController();
const answerRouter = express.Router();

answerRouter.post(
  '/submitWeeklyQuizAnswers',
  answerController.handleSubmitWeeklyQuizAnswers,
);

export default answerRouter;

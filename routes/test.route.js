import express from 'express';

import { resetLeaderboardController } from '../controllers/org.controller.js';
import {
  generateCAnITQuestionsController,
  scheduleQuizzesJobController,
} from '../controllers/question.controller.js';
import {
  cleanUpQuizzesController,
  makeQuizLiveController,
} from '../controllers/quiz.controller.js';

export const testRouter = express.Router();

testRouter.post('/clean-quizzes', cleanUpQuizzesController);

testRouter.post('/make-quizzes-live', makeQuizLiveController);

testRouter.post('/generate-CAnIT-questions', generateCAnITQuestionsController);

testRouter.get('/schedule-quizzes', scheduleQuizzesJobController);

testRouter.post('/reset-leaderboard', resetLeaderboardController);

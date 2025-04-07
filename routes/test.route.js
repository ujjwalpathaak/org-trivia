import express from 'express';

import { resetLeaderboardController } from '../controllers/org.controller.js';
import {
  generateCAnITQuestionsController,
  scheduleQuizzesJobController,
} from '../controllers/question.controller.js';
import {
  cleanUpWeeklyQuizController,
  makeWeeklyQuizLiveController,
} from '../controllers/quiz.controller.js';

export const testRouter = express.Router();

testRouter.post('/test/clean-quizzes', cleanUpWeeklyQuizController);

testRouter.post('/test/make-quizzes-live', makeWeeklyQuizLiveController);

testRouter.post(
  '/test/generate-CAnIT-questions',
  generateCAnITQuestionsController,
);

testRouter.get('/test/schedule-quizzes', scheduleQuizzesJobController);

testRouter.post('/test/reset-leaderboard', resetLeaderboardController);

import express from 'express';

import {
  cleanUpWeeklyQuizController,
  generateCAnITQuestionsController,
  makeWeeklyQuizLiveController,
} from '../controllers/cron.test.controller.js';
import { scheduleQuizzesJob } from '../services/question.service.js';
import { resetLeaderboardController } from '../controllers/leaderboard.controller.js';

export const testRouter = express.Router();

testRouter.post('/test/clean-quizzes', cleanUpWeeklyQuizController);

testRouter.post('/test/make-quizzes-live', makeWeeklyQuizLiveController);

testRouter.post(
  '/test/generate-CAnIT-questions',
  generateCAnITQuestionsController,
);

testRouter.get('/test/scheduleQuizzesJob', scheduleQuizzesJob);

testRouter.post('/test/reset-leaderboard', resetLeaderboardController);
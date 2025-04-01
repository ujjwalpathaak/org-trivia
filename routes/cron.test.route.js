import express from 'express';

import { cleanUpWeeklyQuizController, makeWeeklyQuizLiveController } from '../controllers/cron.test.controller.js';

export const cronTestRouter = express.Router();

cronTestRouter.post(
  '/test/cleanWeeklyQuiz',
  cleanUpWeeklyQuizController,
);

cronTestRouter.post(
  '/test/makeQuizLiveTest',
  makeWeeklyQuizLiveController,
);

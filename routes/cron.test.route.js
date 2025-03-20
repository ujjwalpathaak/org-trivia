import express from 'express';

import cronTestController from '../controllers/cron.test.controller.js';

const cronTestRouter = express.Router();

cronTestRouter.post(
  '/test/cleanWeeklyQuiz',
  cronTestController.cleanWeeklyQuiz,
);

cronTestRouter.post(
  '/test/makeQuizLiveTest',
  cronTestController.makeQuizLiveTest,
);

export default cronTestRouter;

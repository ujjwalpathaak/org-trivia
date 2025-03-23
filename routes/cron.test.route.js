import express from 'express';

import cronTestController from '../controllers/cron.test.controller.js';

const cronTestRouter = express.Router();

cronTestRouter.post(
  '/test/cleanWeeklyQuiz',
  cronTestController.cleanUpWeeklyQuizController,
);

cronTestRouter.post(
  '/test/makeQuizLiveTest',
  cronTestController.makeWeeklyQuizLiveConroller,
);

export default cronTestRouter;

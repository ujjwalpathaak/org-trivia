import express from 'express';
import CronTestController from '../controllers/cron.test.controller.js';

const cronTestController = new CronTestController();
const cronTestRouter = express.Router();

cronTestRouter.post(
  '/test/startPnAWorkflow/:orgId',
  cronTestController.startPnAWorkflow,
);

cronTestRouter.post(
  '/test/startCAnITWorkflow/:orgId',
  cronTestController.startCAnITWorkflow,
);

cronTestRouter.post(
  '/test/cleanWeeklyQuiz',
  cronTestController.cleanWeeklyQuiz,
);

cronTestRouter.post(
  '/test/makeQuizLiveTest',
  cronTestController.makeQuizLiveTest,
);

export default cronTestRouter;

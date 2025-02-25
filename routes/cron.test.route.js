import express from 'express';
import CronTestController from '../controllers/cron.test.controller.js';

const cronTestController = new CronTestController();
const cronTestRouter = express.Router();

cronTestRouter.post(
  '/startPnAWorkflow/:orgId',
  cronTestController.startPnAWorkflow,
);

export default cronTestRouter;

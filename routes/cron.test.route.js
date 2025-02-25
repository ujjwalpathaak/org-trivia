import express from 'express';
import { startPnAWorkflow } from '../controllers/cron.test.controller.js';

const cronTestRouter = express.Router();

cronTestRouter.post('/startPnAWorkflow/:orgId', startPnAWorkflow);

export default cronTestRouter;

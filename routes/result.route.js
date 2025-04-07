import express from 'express';

import {
  getEmployeePastResultsController,
} from '../controllers/result.controller.js';

export const resultRouter = express.Router();

resultRouter.get('/past', getEmployeePastResultsController);

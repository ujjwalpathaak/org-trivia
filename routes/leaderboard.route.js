import express from 'express';

import {
  getOrgLeaderboardController,
  resetLeaderboardController,
} from '../controllers/leaderboard.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

export const leaderboardRouter = express.Router();

leaderboardRouter.get('/', protectRoute, getOrgLeaderboardController);

import express from 'express';

import { getLeaderboardByOrgController, resetLeaderboardController } from '../controllers/leaderboard.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

export const leaderboardRouter = express.Router();

leaderboardRouter.get(
  '/',
  protectRoute,
  getLeaderboardByOrgController,
);
leaderboardRouter.post(
  '/test/reset',
  resetLeaderboardController,
);

import express from 'express';

import LeaderboardController from '../controllers/leaderboard.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const leaderboardController = new LeaderboardController();

const leaderboardRouter = express.Router();

// test
leaderboardRouter.get(
  '/:orgId',
  protectRoute,
  leaderboardController.getLeaderboardByOrg,
);
leaderboardRouter.post(
  '/test/reset',
  leaderboardController.resetLeaderboardTest,
);

export default leaderboardRouter;

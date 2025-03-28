import express from 'express';

import leaderboardController from '../controllers/leaderboard.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const leaderboardRouter = express.Router();

leaderboardRouter.get(
  '/',
  protectRoute,
  leaderboardController.getLeaderboardByOrgController,
);
leaderboardRouter.post(
  '/test/reset',
  leaderboardController.resetLeaderboardController,
);

export default leaderboardRouter;

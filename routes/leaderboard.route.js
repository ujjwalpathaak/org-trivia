import express from 'express';

import leaderboardController from '../controllers/leaderboard.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const leaderboardRouter = express.Router();

leaderboardRouter.get(
  '/:orgId',
  protectRoute,
  leaderboardController.getLeaderboardByOrgHandler,
);
leaderboardRouter.post(
  '/test/reset',
  leaderboardController.resetLeaderboardHandler,
);

export default leaderboardRouter;

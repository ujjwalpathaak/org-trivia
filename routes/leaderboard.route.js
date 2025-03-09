import express from 'express';
import LeaderboardController from '../controllers/leaderboard.controller.js';

const leaderboardController = new LeaderboardController();

const leaderboardRouter = express.Router();

// test
leaderboardRouter.get('/:orgId', leaderboardController.getLeaderboardByOrg);
leaderboardRouter.post('/reset', leaderboardController.resetLeaderboardTest);

export default leaderboardRouter;

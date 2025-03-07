import express from 'express';
import LeaderboardController from '../controllers/leaderboard.controller.js';

const leaderboardController = LeaderboardController();

const leaderboardRouter = express.Router();


export default leaderboardRouter;

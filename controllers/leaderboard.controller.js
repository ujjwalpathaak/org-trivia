import { ObjectId } from 'mongodb';

import leaderboardService from '../services/leaderboard.service.js';

const getLeaderboardByOrgHandler = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const { orgId } = req.data;
    if (!orgId || !ObjectId.isValid(orgId)) {
      return res.status(400).json({ message: 'Invalid or missing orgId' });
    }
    const leaderboard = await leaderboardService.getLeaderboardByOrg(orgId, month, year);
    res.status(200).json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    next(error);
  }
};

const resetLeaderboardHandler = async (req, res, next) => {
  try {
    await leaderboardService.resetLeaderboard();
    res.status(200).json({ message: 'Leaderboard refreshed successfully' });
  } catch (error) {
    console.error('Error resetting leaderboard:', error);
    next(error);
  }
};

export default { getLeaderboardByOrgHandler, resetLeaderboardHandler };

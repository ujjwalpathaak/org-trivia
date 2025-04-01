import { ObjectId } from 'mongodb';
import {
  getLeaderboardByOrgService,
  resetLeaderboardService,
} from '../services/leaderboard.service.js';

export const getLeaderboardByOrgController = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const { orgId } = req.data;
    if (!orgId || !ObjectId.isValid(orgId)) {
      return res.status(400).json({ message: 'Invalid or missing orgId' });
    }
    const leaderboard = await getLeaderboardByOrgService(
      orgId,
      month,
      year,
    );
    res.status(200).json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    next(error);
  }
};

export const resetLeaderboardController = async (req, res, next) => {
  try {
    const { orgId } = req.data;
    if (!orgId || !ObjectId.isValid(orgId)) {
      return res.status(400).json({ message: 'Invalid or missing orgId' });
    }
    await resetLeaderboardService(orgId);
    res.status(200).json({ message: 'Leaderboard reset successfully' });
  } catch (error) {
    console.error('Error resetting leaderboard:', error);
    next(error);
  }
};

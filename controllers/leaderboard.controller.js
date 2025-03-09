import LeaderboardService from '../services/leaderboard.service.js';
import LeaderboardRepository from '../repositories/leaderboard.respository.js';

const leaderboardService = new LeaderboardService(new LeaderboardRepository());

class LeaderboardController {
  async getLeaderboardByOrg(req, res, next) {
    try {
      const { orgId } = req.params;
      if (!orgId) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      const leaderboard = await leaderboardService.getLeaderboardByOrg(orgId);
      res.status(200).json(leaderboard);
    } catch (error) {
      next(error);
    }
  }

  async resetLeaderboardTest(req, res, next) {
    try {
      await leaderboardService.resetLeaderboard();
      res.status(200).json({ message: 'Leaderboard refreshed successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export default LeaderboardController;

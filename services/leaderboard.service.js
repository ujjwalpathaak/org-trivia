import {
  getMonthAndYear,
  getPreviousMonthAndYear,
} from '../middleware/utils.js';
import leaderboardRespository from '../repositories/leaderboard.respository.js';

const getLeaderboardByOrg = async (orgId, month, year) => {
  const [leaderboard, yearBoundary] = await Promise.all([
    leaderboardRespository.getLeaderboardByOrg(orgId, month, year),
    leaderboardRespository.getLeaderboardYearBoundary(orgId)
  ]);

  return {
    leaderboard: leaderboard,
    yearBoundary: yearBoundary
  }
};

const resetLeaderboard = async () => {
  const [month, year] = getMonthAndYear();
  const [pMonth, pYear] = getPreviousMonthAndYear();
  return leaderboardRespository.resetLeaderboard(month, year, pMonth, pYear);
};

export default { getLeaderboardByOrg, resetLeaderboard };

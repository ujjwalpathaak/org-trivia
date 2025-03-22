import {
  getMonthAndYear,
  getPreviousMonthAndYear,
} from '../middleware/utils.js';
import leaderboardRespository from '../repositories/leaderboard.respository.js';

const getLeaderboardByOrg = async (orgId) => {
  const [month, year] = getMonthAndYear();
  return leaderboardRespository.getLeaderboardByOrg(orgId, month, year);
};

const resetLeaderboard = async () => {
  const [month, year] = getMonthAndYear();
  const [pMonth, pYear] = getPreviousMonthAndYear();
  return leaderboardRespository.resetLeaderboard(month, year, pMonth, pYear);
};

export default { getLeaderboardByOrg, resetLeaderboard };

import {
  getMonthAndYear,
  getPreviousMonthAndYear,
} from '../middleware/utils.js';
import { getValue, setValue } from '../Redis.js';
import leaderboardRespository from '../repositories/leaderboard.respository.js';

const getLeaderboardByOrgService = async (orgId, month, year) => {
  const cache = await getValue(`leaderboard:${orgId}:${month}:${year}`);
  const cache2 = await getValue(`yearBoundary:${orgId}:${month}:${year}`);

  if (cache && cache2) {
    return {
      leaderboard: cache,
      yearBoundary: cache2,
    };
  }

  const [leaderboard, yearBoundary] = await Promise.all([
    leaderboardRespository.getLeaderboardByOrg(orgId, month, year),
    leaderboardRespository.getLeaderboardYearBoundary(orgId),
  ]);

  await Promise.all([
    setValue(`leaderboard:${orgId}:${month}:${year}`, leaderboard, 300),
    setValue(`yearBoundary:${orgId}:${month}:${year}`, yearBoundary, 300),
  ]);

  return { leaderboard, yearBoundary };
};

const resetLeaderboardService = async () => {
  const [month, year] = getMonthAndYear();
  const [pMonth, pYear] = getPreviousMonthAndYear();
  return leaderboardRespository.resetLeaderboard(month, year, pMonth, pYear);
};

export default { getLeaderboardByOrgService, resetLeaderboardService };

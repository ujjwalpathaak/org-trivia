import { getValue, setValue } from '../Redis.js';
import {
  getLeaderboardByOrg,
  getLeaderboardYearBoundary,
  resetLeaderboard,
} from '../repositories/leaderboard.respository.js';

export const getLeaderboardByOrgService = async (orgId, month, year) => {
  const cache = await getValue(`leaderboard:${orgId}:${month}:${year}`);
  const cache2 = await getValue(`yearBoundary:${orgId}:${month}:${year}`);

  if (cache && cache2) {
    return {
      leaderboard: cache,
      yearBoundary: cache2,
    };
  }

  const [leaderboard, yearBoundary] = await Promise.all([
    getLeaderboardByOrg(orgId, month, year),
    getLeaderboardYearBoundary(orgId),
  ]);

  await Promise.all([
    setValue(`leaderboard:${orgId}:${month}:${year}`, leaderboard),
    setValue(`yearBoundary:${orgId}:${month}:${year}`, yearBoundary),
  ]);

  return {
    leaderboard,
    yearBoundary,
  };
};

export const resetLeaderboardService = async (orgId) => {
  await resetLeaderboard(orgId);
  return { message: 'Leaderboard reset successfully' };
};

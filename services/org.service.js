import { getValue, setValue } from '../Redis.js';
import {
  getLeaderboardByOrg,
  getLeaderboardYearBoundary,
  resetLeaderboard,
} from '../repositories/leaderboard.respository.js';
import {
  changeCompanyCurrentAffairsTimeline,
  changeGenreSettings,
  getAllOrgNames,
  getOrgAnalytics,
  getOrgSettings,
  toggleTrivia,
} from '../repositories/org.repository.js';
import { changeQuizGenreWorkflow } from './question.service.js';

export const saveSettingsService = async (
  orgId,
  newGenreOrder,
  changedGenres,
  companyCurrentAffairsTimeline,
) => {
  const response = await changeQuizGenreWorkflow(changedGenres, orgId);
  if (response?.status === 400) return response;

  await changeCompanyCurrentAffairsTimeline(
    orgId,
    companyCurrentAffairsTimeline,
  );
  await changeGenreSettings(newGenreOrder, orgId);

  return { status: 200, message: 'Settings saved successfully' };
};

export const getSettingsService = async (orgId) => {
  const settings = await getOrgSettings(orgId);
  return settings;
};

export const getAllOrgNamesService = async () => {
  const cache = await getValue('allOrgNames');
  if (cache) {
    return cache;
  }
  return await getAllOrgNames();
};

export const toggleTriviaService = async (orgId, isEnabled) => {
  await toggleTrivia(orgId, isEnabled);
  await setValue(`org:${orgId}`, null);
  return { message: 'Trivia settings updated successfully' };
};

export const getAnalyticsService = async (orgId) => {
  const cache = await getValue(`org:${orgId}:analytics`);
  if (cache) {
    return cache;
  }
  const analytics = await getOrgAnalytics(orgId);
  await setValue(`org:${orgId}:analytics`, analytics);
  return analytics;
};

export const resetLeaderboardService = async () => {
  await resetLeaderboard();
  return { message: 'Leaderboard reset successfully' };
};

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

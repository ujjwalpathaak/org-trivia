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

/**
 * Saves organization settings including genre order and company current affairs timeline
 * @param {string} orgId - The ID of the organization
 * @param {Array} newGenreOrder - New order of genres
 * @param {Array} changedGenres - List of genres that have been changed
 * @param {string} companyCurrentAffairsTimeline - Timeline setting for company current affairs
 * @returns {Promise<Object>} Response object containing status and message
 */
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

/**
 * Retrieves settings for a specific organization
 * @param {string} orgId - The ID of the organization
 * @returns {Promise<Object>} Organization settings object
 */
export const getSettingsService = async (orgId) => {
  const settings = await getOrgSettings(orgId);
  return settings;
};

/**
 * Retrieves all organization names (from cache if available)
 * @returns {Promise<Array>} List of organization names
 */
export const getAllOrgNamesService = async () => {
  const cache = await getValue('allOrgNames');
  if (cache) {
    return cache;
  }
  return await getAllOrgNames();
};

/**
 * Enables or disables trivia for a specific organization
 * @param {string} orgId - The ID of the organization
 * @param {boolean} isEnabled - Whether trivia is enabled or not
 * @returns {Promise<Object>} Response message
 */
export const toggleTriviaService = async (orgId, isEnabled) => {
  await toggleTrivia(orgId, isEnabled);
  await setValue(`org:${orgId}`, null);
  return { message: 'Trivia settings updated successfully' };
};

/**
 * Retrieves analytics for a specific organization (from cache if available)
 * @param {string} orgId - The ID of the organization
 * @returns {Promise<Object>} Organization analytics object
 */
export const getAnalyticsService = async (orgId) => {
  const cache = await getValue(`org:${orgId}:analytics`);
  if (cache) {
    return cache;
  }
  const analytics = await getOrgAnalytics(orgId);
  await setValue(`org:${orgId}:analytics`, analytics);
  return analytics;
};

/**
 * Resets the leaderboard data for all organizations
 * @returns {Promise<Object>} Response message
 */
export const resetLeaderboardService = async () => {
  await resetLeaderboard();
  return { message: 'Leaderboard reset successfully' };
};

/**
 * Retrieves leaderboard and its year boundary for a specific organization and month/year
 * Uses cache if available, otherwise fetches from database and sets cache
 * @param {string} orgId - The ID of the organization
 * @param {number} month - The month for which leaderboard is needed
 * @param {number} year - The year for which leaderboard is needed
 * @returns {Promise<Object>} Object containing leaderboard and year boundary
 */
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

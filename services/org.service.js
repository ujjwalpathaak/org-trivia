import { getValue, setValue } from '../Redis.js';
import {
  changeCompanyCurrentAffairsTimeline,
  changeGenreSettings,
  getAllOrgNames,
  getOrgAnalytics,
  getOrgById,
  getOrgSettings,
  toggleTrivia,
} from '../repositories/org.repository.js';
import { changeQuizGenre } from '../repositories/quiz.repository.js';

export const saveSettingsService = async (
  orgId,
  newGenreOrder,
  changedGenres,
  companyCurrentAffairsTimeline,
) => {
  await Promise.all(
    changedGenres.map(async (genre) => {
      return await changeQuizGenre(genre.newGenre, genre.quizId);
    }),
  );
  await changeCompanyCurrentAffairsTimeline(
    orgId,
    companyCurrentAffairsTimeline,
  );
  await changeGenreSettings(newGenreOrder, orgId);
  return { message: 'Settings saved successfully' };
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

export const getOrgByIdService = async (orgId) => {
  return await getOrgById(orgId);
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

import { getValue, setValue } from '../Redis.js';
import {
  changeCompanyCurrentAffairsTimeline,
  getOrgSettings,
  getAllOrgNames,
  getOrgById,
  toggleTrivia,
  getOrgAnalytics,
} from '../repositories/org.repository.js';
import { changeQuizGenre } from '../repositories/quiz.repository.js';

export const saveSettingsService = async (
  orgId,
  newGenreOrder,
  changedGenres,
  companyCurrentAffairsTimeline,
) => {
  console.log(
    orgId,
    newGenreOrder,
    changedGenres,
    companyCurrentAffairsTimeline,
  );
  await Promise.all(
    changedGenres.map(async (genre) => {
      return await changeQuizGenre(genre.newGenre, genre.quizId);
    }),
  );
  await changeCompanyCurrentAffairsTimeline(
    orgId,
    companyCurrentAffairsTimeline,
  );
  await setValue(`org:${orgId}`, null);
  return { message: 'Settings saved successfully' };
};

export const getSettingsService = async (orgId) => {
  const cache = await getValue(`org:${orgId}`);
  if (cache) {
    return cache;
  }
  const settings = await getOrgSettings(orgId);
  await setValue(`org:${orgId}`, settings);
  return settings;
};

export const getAllOrgNamesService = async () => {
  const cache = await getValue('allOrgNames');
  if (cache) {
    return cache;
  }
  const orgs = await getAllOrgNames();
  await setValue('allOrgNames', orgs);
  return orgs;
};

export const getOrgByIdService = async (orgId) => {
  const cache = await getValue(`org:${orgId}`);
  if (cache) {
    return cache;
  }
  const org = await getOrgById(orgId);
  await setValue(`org:${orgId}`, org);
  return org;
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

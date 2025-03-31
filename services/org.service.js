import { getValue, setValue } from '../Redis.js';
import orgRepository from '../repositories/org.repository.js';
import quizRepository from '../repositories/quiz.repository.js';

const saveSettingsService = async (orgId, newGenreOrder, changedGenres) => {
  console.log(changedGenres)
  Promise.all(
    changedGenres.map(async (genre) => {
      return await quizRepository.changeQuizGenre(genre.newGenre, genre.quizId);
    }),
  );
  return await orgRepository.changeGenreSettings(newGenreOrder, orgId);
};

const getSettings = async (orgId) => {
  const org = await orgRepository.getSettings(orgId);
  return org?.settings;
};

const getAllOrgNames = async () => {
  return await orgRepository.getAllOrgNames();
};

const getOrgById = async (orgId) => {
  return await orgRepository.getOrgById(orgId);
};

const toggleTrivia = async (orgId) => {
  const org = await orgRepository.isTriviaEnabled(orgId);
  if (!org) return false;

  const newStatus = !org.settings.isTriviaEnabled;
  return await orgRepository.updateTriviaSettings(orgId, newStatus);
};

const getAnalytics = async (orgId) => {
  const cache = await getValue(`analytics:${orgId}`);
  if (cache) return cache;

  const analytics = await orgRepository.getAnalytics(orgId);

  await setValue(`analytics:${orgId}`, analytics, 600);

  return analytics;
};

export default {
  saveSettingsService,
  getSettings,
  getAllOrgNames,
  getOrgById,
  toggleTrivia,
  getAnalytics,
};

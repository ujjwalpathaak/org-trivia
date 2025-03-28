import { getValue, setValue } from '../Redis.js';
import orgRepository from '../repositories/org.repository.js';

const changeGenreSettings = async (genre, orgId) => {
  return await orgRepository.changeGenreSettings(genre, orgId);
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
  changeGenreSettings,
  getSettings,
  getAllOrgNames,
  getOrgById,
  toggleTrivia,
  getAnalytics,
};

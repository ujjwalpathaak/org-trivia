import {
  getAllOrgNamesService,
  getAnalyticsService,
  getSettingsService,
  saveSettingsService,
  toggleTriviaService,
} from '../services/org.service.js';

export const saveNewSettingsController = async (req, res, next) => {
  try {
    const { orgId } = req.data;
    const { newGenreOrder, changedGenres, companyCurrentAffairsTimeline } =
      req.body;
    await saveSettingsService(
      orgId,
      newGenreOrder,
      changedGenres,
      companyCurrentAffairsTimeline,
    );
    res.json({ message: 'Genre settings updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const getSettingsController = async (req, res, next) => {
  try {
    const { orgId } = req.data;
    const settings = await getSettingsService(orgId);
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

export const toggleTriviaController = async (req, res, next) => {
  try {
    const { orgId } = req.data;
    const { isEnabled } = req.body;
    await toggleTriviaService(orgId, isEnabled);
    res.json({ message: 'Trivia settings updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const getAllOrgNamesController = async (req, res, next) => {
  try {
    const orgs = await getAllOrgNamesService();
    res.json(orgs);
  } catch (error) {
    next(error);
  }
};

export const getAnalyticsController = async (req, res, next) => {
  try {
    const { orgId } = req.data;
    const analytics = await getAnalyticsService(orgId);
    res.json(analytics);
  } catch (error) {
    next(error);
  }
};

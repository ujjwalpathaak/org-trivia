import {
  getAllOrgNamesService,
  getAnalyticsService,
  getSettingsService,
  saveSettingsService,
  toggleTriviaService,
} from '../services/org.service.js';

export const resetLeaderboardController = async (req, res, next) => {
  try {
    const { orgId } = req.data;
    if (!orgId || !ObjectId.isValid(orgId)) {
      return res.status(400).json({ message: 'Invalid or missing orgId' });
    }
    await resetLeaderboardService(orgId);
    res.status(200).json({ message: 'Leaderboard reset successfully' });
  } catch (error) {
    console.error('Error resetting leaderboard:', error);
    next(error);
  }
};

export const getOrgLeaderboardController = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const { orgId } = req.data;
    if (!orgId || !ObjectId.isValid(orgId)) {
      return res.status(400).json({ message: 'Invalid or missing orgId' });
    }
    const leaderboard = await getLeaderboardByOrgService(orgId, month, year);
    res.status(200).json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    next(error);
  }
};

export const saveOrgSettingsController = async (req, res, next) => {
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

export const getOrgSettingsController = async (req, res, next) => {
  try {
    const { orgId } = req.data;
    const settings = await getSettingsService(orgId);
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

export const toggleOrgTriviaSettingController = async (req, res, next) => {
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

export const getOrgAnalyticsController = async (req, res, next) => {
  try {
    const { orgId } = req.data;
    const analytics = await getAnalyticsService(orgId);
    res.json(analytics);
  } catch (error) {
    next(error);
  }
};

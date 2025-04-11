import {
  getAllOrgNamesService,
  getAnalyticsService,
  getLeaderboardByOrgService,
  getSettingsService,
  resetLeaderboardService,
  saveSettingsService,
  toggleTriviaService,
} from '../services/org.service.js';

/**
 * Resets the leaderboard for all organizations
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const resetLeaderboardController = async (req, res, next) => {
  try {
    await resetLeaderboardService();
    res.status(200).json({ message: 'Leaderboard reset successfully' });
  } catch (error) {
    console.error('Error resetting leaderboard:', error);
    next(error);
  }
};

/**
 * Gets the leaderboard for a specific organization
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {number} req.query.month - Month to get leaderboard for (0-11)
 * @param {number} req.query.year - Year to get leaderboard for
 * @param {Object} req.data - Request data containing orgId
 * @param {string} req.data.orgId - Organization ID
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const getOrgLeaderboardController = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const { orgId } = req.data;
    if (!orgId) {
      return res.status(400).json({ message: 'Missing orgId' });
    }
    const leaderboard = await getLeaderboardByOrgService(orgId, month, year);
    res.status(200).json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    next(error);
  }
};

/**
 * Saves organization settings
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {Array} req.body.newGenreOrder - New order of genres
 * @param {Array} req.body.changedGenres - List of genres that have been changed
 * @param {string} req.body.companyCurrentAffairsTimeline - Timeline setting for company current affairs
 * @param {Object} req.data - Request data containing orgId
 * @param {string} req.data.orgId - Organization ID
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const saveOrgSettingsController = async (req, res, next) => {
  try {
    const { orgId } = req.data;
    if (!orgId) {
      return res.status(400).json({ message: 'Missing orgId' });
    }
    const { newGenreOrder, changedGenres, companyCurrentAffairsTimeline } =
      req.body;
    const response = await saveSettingsService(
      orgId,
      newGenreOrder,
      changedGenres,
      companyCurrentAffairsTimeline,
    );
    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Gets organization settings
 * @param {Object} req - Express request object
 * @param {Object} req.data - Request data containing orgId
 * @param {string} req.data.orgId - Organization ID
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const getOrgSettingsController = async (req, res, next) => {
  try {
    const { orgId } = req.data;
    if (!orgId) {
      return res.status(400).json({ message: 'Missing orgId' });
    }
    const settings = await getSettingsService(orgId);
    res.status(200).json(settings);
  } catch (error) {
    next(error);
  }
};

/**
 * Toggles trivia settings for an organization
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {boolean} req.body.isEnabled - Whether to enable or disable trivia
 * @param {Object} req.data - Request data containing orgId
 * @param {string} req.data.orgId - Organization ID
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const toggleOrgTriviaSettingController = async (req, res, next) => {
  try {
    const { orgId } = req.data;
    if (!orgId) {
      return res.status(400).json({ message: 'Missing orgId' });
    }
    const { isEnabled } = req.body;
    await toggleTriviaService(orgId, isEnabled);
    res.status(200).json({ message: 'Trivia settings updated successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Gets names of all organizations
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const getAllOrgNamesController = async (req, res, next) => {
  try {
    const orgs = await getAllOrgNamesService();
    res.status(200).json(orgs);
  } catch (error) {
    next(error);
  }
};

/**
 * Gets analytics for an organization
 * @param {Object} req - Express request object
 * @param {Object} req.data - Request data containing orgId
 * @param {string} req.data.orgId - Organization ID
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const getOrgAnalyticsController = async (req, res, next) => {
  try {
    const { orgId } = req.data;
    if (!orgId) {
      return res.status(400).json({ message: 'Missing orgId' });
    }
    const analytics = await getAnalyticsService(orgId);
    res.status(200).json(analytics);
  } catch (error) {
    next(error);
  }
};

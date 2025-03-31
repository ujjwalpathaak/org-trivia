import OrgService from '../services/org.service.js';

const saveNewSettingsController = async (req, res, next) => {
  try {
    const { orgId } = req.data;
    const {newGenreOrder, changedGenres} = req.body;

    await OrgService.saveSettingsService(orgId, newGenreOrder, changedGenres);
    res.json({ message: 'Genre settings updated successfully' });
  } catch (error) {
    next(error);
  }
};

const getSettings = async (req, res, next) => {
  try {
    const { orgId } = req.data;
    if (!orgId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const orgSettings = await OrgService.getSettings(orgId);
    res.status(200).json(orgSettings);
  } catch (error) {
    next(error);
  }
};

const toggleTrivia = async (req, res, next) => {
  try {
    const { orgId } = req.data;
    if (!orgId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const response = await OrgService.toggleTrivia(orgId);
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

const getAllOrgNames = async (req, res, next) => {
  try {
    const response = await OrgService.getAllOrgNames();
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

const getAnalytics = async (req, res, next) => {
  try {
    const { orgId } = req.data;
    if (!orgId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const analytics = await OrgService.getAnalytics(orgId);
    res.status(200).json(analytics);
  } catch (error) {
    next(error);
  }
};

export default {
  saveNewSettingsController,
  getSettings,
  toggleTrivia,
  getAllOrgNames,
  getAnalytics,
};

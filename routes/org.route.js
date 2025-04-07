import express from 'express';

import {
  getAllOrgNamesController,
  getOrgAnalyticsController,
  getOrgSettingsController,
  saveOrgSettingsController,
  toggleOrgTriviaSettingController,
} from '../controllers/org.controller.js';
import { checkRole, protectRoute } from '../middleware/auth.middleware.js';
import { getOrgLeaderboardController } from '../controllers/leaderboard.controller.js';

export const orgRouter = express.Router();

orgRouter.get('/', getAllOrgNamesController);

orgRouter.patch(
  '/settings/trivia/toggle',
  protectRoute,
  checkRole('Admin'),
  toggleOrgTriviaSettingController,
);

orgRouter.get(
  '/settings',
  protectRoute,
  checkRole('Admin'),
  getOrgSettingsController,
);

orgRouter.post(
  '/settings/save',
  protectRoute,
  checkRole('Admin'),
  saveOrgSettingsController,
);

orgRouter.get(
  '/analytics',
  protectRoute,
  checkRole('Admin'),
  getOrgAnalyticsController,
);

orgRouter.get(
  '/leaderboard',
  protectRoute,
  getOrgLeaderboardController,
);

import express from 'express';

import {
  getAllOrgNamesController,
  getAnalyticsController,
  getSettingsController,
  saveNewSettingsController,
  toggleTriviaController,
} from '../controllers/org.controller.js';
import { checkRole, protectRoute } from '../middleware/auth.middleware.js';

export const orgRouter = express.Router();

orgRouter.get('/', getAllOrgNamesController);

orgRouter.patch(
  '/settings/trivia/toggle',
  protectRoute,
  checkRole('Admin'),
  toggleTriviaController,
);

orgRouter.get(
  '/settings',
  protectRoute,
  checkRole('Admin'),
  getSettingsController,
);

orgRouter.post(
  '/settings/save',
  protectRoute,
  checkRole('Admin'),
  saveNewSettingsController,
);

orgRouter.get(
  '/analytics',
  protectRoute,
  checkRole('Admin'),
  getAnalyticsController,
);

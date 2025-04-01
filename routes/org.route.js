import express from 'express';

import { saveNewSettingsController, getAllOrgNamesController, toggleTriviaController, getSettingsController, getAnalyticsController } from '../controllers/org.controller.js';
import { checkRole, protectRoute } from '../middleware/auth.middleware.js';

export const orgRouter = express.Router();

orgRouter.get('/', getAllOrgNamesController);

orgRouter.patch(
  '/settings/toggleTrivia',
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
  '/save/settings',
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

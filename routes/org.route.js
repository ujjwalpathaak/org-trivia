import express from 'express';

import { getAllOrgNames, toggleTrivia, getSettings, saveNewSettingsController, getAnalytics } from '../controllers/org.controller.js';
import { checkRole, protectRoute } from '../middleware/auth.middleware.js';

export const orgRouter = express.Router();

orgRouter.get('/', getAllOrgNames);

orgRouter.patch(
  '/settings/toggleTrivia',
  protectRoute,
  checkRole('Admin'),
  toggleTrivia,
);

orgRouter.get(
  '/settings',
  protectRoute,
  checkRole('Admin'),
  getSettings,
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
  getAnalytics,
);

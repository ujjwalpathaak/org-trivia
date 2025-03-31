import express from 'express';

import OrgController from '../controllers/org.controller.js';
import { checkRole, protectRoute } from '../middleware/auth.middleware.js';

const orgRouter = express.Router();

orgRouter.get('/', OrgController.getAllOrgNames);

orgRouter.patch(
  '/settings/toggleTrivia',
  protectRoute,
  checkRole('Admin'),
  OrgController.toggleTrivia,
);

orgRouter.get(
  '/settings',
  protectRoute,
  checkRole('Admin'),
  OrgController.getSettings,
);

orgRouter.post(
  '/save/settings',
  protectRoute,
  checkRole('Admin'),
  OrgController.saveNewSettingsController,
);

orgRouter.get(
  '/analytics',
  protectRoute,
  checkRole('Admin'),
  OrgController.getAnalytics,
);

export default orgRouter;

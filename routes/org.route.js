import express from 'express';
import OrgController from '../controllers/org.controller.js';

import { protectRoute, checkRole } from '../middleware/auth.middleware.js';

const orgController = new OrgController();

const orgRouter = express.Router();

orgRouter.get('/', orgController.getAllOrgNames);

orgRouter.patch(
  '/settings/toggleTrivia/:orgId',
  protectRoute,
  checkRole('Admin'),
  orgController.toggleTrivia,
);
orgRouter.get(
  '/settings/:orgId',
  protectRoute,
  checkRole('Admin'),
  orgController.getSettings,
);
orgRouter.post(
  '/settings/genre/:orgId',
  protectRoute,
  checkRole('Admin'),
  orgController.changeGenreSettings,
);
orgRouter.get(
  '/analytics/:orgId',
  protectRoute,
  checkRole('Admin'),
  orgController.getAnalytics,
);

export default orgRouter;

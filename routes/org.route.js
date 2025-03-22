import express from 'express';

import OrgController from '../controllers/org.controller.js';
import { checkRole, protectRoute } from '../middleware/auth.middleware.js';

const orgRouter = express.Router();

orgRouter.get('/', OrgController.getAllOrgNames);

orgRouter.patch(
  '/settings/toggleTrivia/:orgId',
  protectRoute,
  checkRole('Admin'),
  OrgController.toggleTrivia,
);

orgRouter.get(
  '/settings/:orgId',
  protectRoute,
  checkRole('Admin'),
  OrgController.getSettings,
);

orgRouter.post(
  '/settings/genre/:orgId',
  protectRoute,
  checkRole('Admin'),
  OrgController.changeGenreSettings,
);

orgRouter.get(
  '/analytics/:orgId',
  protectRoute,
  checkRole('Admin'),
  OrgController.getAnalytics,
);

export default orgRouter;

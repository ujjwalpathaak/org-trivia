import express from 'express';
import OrgController from '../controllers/org.controller.js';

import { protectRoute, checkRole } from '../middleware/auth.middleware.js';

const orgController = new OrgController();

const orgRouter = express.Router();

orgRouter.get('/', orgController.getAllOrgNames);

orgRouter.patch('/settings/toggleTrivia/:orgId', protectRoute, checkRole("Admin"), orgController.toggleTrivia);
orgRouter.get('/settings/:orgId', protectRoute, checkRole("Admin"), orgController.getSettings);

export default orgRouter;

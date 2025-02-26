import express from 'express';
import OrgController from '../controllers/org.controller.js';

const orgController = new OrgController();

const orgRouter = express.Router();

orgRouter.get('/', orgController.getAllOrgNames);

export default orgRouter;

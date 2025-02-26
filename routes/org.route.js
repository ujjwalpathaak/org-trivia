import express from 'express';
import OrgController from '../controllers/org.controller.js';

const OrgController = new OrgController();

const orgRouter = express.Router();

orgRouter.get('/', OrgController.getAllOrgNames);

export default orgRouter;

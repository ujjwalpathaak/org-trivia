import express from 'express';
import {
  getAllOrgs,
} from '../controllers/org.controller.js';

const orgRouter = express.Router();

orgRouter.get('/', getAllOrgs);

export default orgRouter;

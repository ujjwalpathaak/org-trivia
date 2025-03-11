import express from 'express';
import BadgeController from '../controllers/badge.controller.js';

const badgeController = new BadgeController();
const badgeRouter = express.Router();

export default badgeRouter;

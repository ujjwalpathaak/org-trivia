import express from 'express';

import AuthController from '../controllers/auth.controller.js';

const authController = new AuthController();
const authRouter = express.Router();

authRouter.post('/login', authController.login);
authRouter.post('/register', authController.register);

export default authRouter;

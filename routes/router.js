import express from 'express';

import { protectRoute } from '../middleware/auth.middleware.js';
import { sanitizeRequest } from '../middleware/sanitizeRequest.js';
import { authRouter } from './auth.route.js';
import { employeeRouter } from './employee.route.js';
import { orgRouter } from './org.route.js';
import { questionRouter } from './question.route.js';
import { quizRouter } from './quiz.route.js';
import { testRouter } from './test.route.js';
import uploadRouter from '../upload.js';
import { addNewHRPQuestionsCallbackController, generateNewHRPQuestionsCallbackController } from '../controllers/question.controller.js';

export const router = express.Router();

router.get('/', (req, res) => res.send('API Working'));

router.use('/auth', authRouter);
router.post('/question/generate/HRP', protectRoute, generateNewHRPQuestionsCallbackController);
router.post('/question/add/HRP', addNewHRPQuestionsCallbackController);
router.use('/upload', uploadRouter);

router.use(sanitizeRequest);
router.use('/employee', protectRoute, employeeRouter);
router.use('/org', orgRouter);
router.use('/question', questionRouter);
router.use('/quiz', quizRouter);

router.use('/test', testRouter);

router.use('*', (req, res, next) => {
  const error = new Error(`Cannot reach ${req.originalUrl} on server!`);
  error.status = 404;
  next(error);
});

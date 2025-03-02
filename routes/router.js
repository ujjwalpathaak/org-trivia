import express from 'express';

import authRouter from './auth.route.js';
import employeeRouter from './employee.route.js';
import { checkRole, protectRoute } from '../middleware/auth.middleware.js';
import orgRouter from './org.route.js';
import questionRouter from './question.route.js';
import cronTestRouter from './cron.test.route.js';
import answerRouter from './answer.route.js';
import quizRouter from './quiz.route.js';

const router = express.Router();

router.get('/', (req, res) => res.send('API Working'));

router.use('/auth', authRouter);
router.use('/employee', protectRoute, checkRole('Admin'), employeeRouter);
router.use('/org', orgRouter);
router.use('/question', questionRouter);
router.use('/cron', protectRoute, checkRole('Admin'), cronTestRouter);
router.use('/answer', protectRoute, checkRole('Employee'), answerRouter);
router.use('/quiz', quizRouter);

router.use('*', (req, res, next) => {
  const error = new Error(`Cannot reach ${req.originalUrl} on server!`);
  error.status = 404;
  next(error);
});

export default router;

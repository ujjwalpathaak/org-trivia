import express from 'express';

import authRouter from './auth.route.js';
import employeeRouter from './employee.route.js';
import { checkRole, protectRoute } from '../middleware/auth.middleware.js';
import orgRouter from './org.route.js';
import questionRouter from './question.route.js';
import cronTestRouter from './cron.test.route.js';
import resultRouter from './result.route.js';
import quizRouter from './quiz.route.js';
import leaderboardRouter from './leaderboard.route.js';
import badgeRouter from './badge.route.js';

const router = express.Router();

router.get('/', (req, res) => res.send('API Working'));

router.use('/auth', authRouter);
router.use('/employee', protectRoute, employeeRouter);
router.use('/org', orgRouter);
router.use('/question', questionRouter);
router.use('/cron', cronTestRouter);
router.use('/result', protectRoute, checkRole('Employee'), resultRouter);
router.use('/leaderboard', leaderboardRouter);
router.use('/badge', badgeRouter);
router.use('/quiz', quizRouter);

router.use('*', (req, res, next) => {
  const error = new Error(`Cannot reach ${req.originalUrl} on server!`);
  error.status = 404;
  next(error);
});

export default router;

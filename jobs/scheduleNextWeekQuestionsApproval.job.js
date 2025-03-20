import cron from 'node-cron';

import leaderboardService from '../services/leaderboard.service.js';
import questionService from '../services/question.service.js';
import quizService from '../services/quiz.service.js';

export const scheduleNextWeekQuestionsApproval = cron.schedule(
  '5 0 * * 6',
  async () => {
    console.log('Running Scheduled Task: Next Week Questions Approval...');

    await questionService.scheduleNextWeekQuestionsApproval();
  },
  { scheduled: true, timezone: 'UTC' },
);

export const cleanUpWeeklyQuiz = cron.schedule(
  '1 0 * * 5',
  async () => {
    console.log('Running Scheduled Task: Clean Up Weekly Quiz...');

    await quizService.cleanUpWeeklyQuiz();
  },
  { scheduled: true, timezone: 'UTC' },
);

export const makeWeeklyQuizLive = cron.schedule(
  '1 0 * * 5',
  async () => {
    console.log('Running Scheduled Task: Make Weekly Quiz Live...');

    await quizService.makeWeeklyQuizLive();
  },
  { scheduled: true, timezone: 'UTC' },
);

export const resetLeaderboard = cron.schedule(
  '1 0 * * 5',
  async () => {
    console.log('Running Scheduled Task: Reset Leaderboard...');

    await leaderboardService.resetLeaderboard();
  },
  { scheduled: true, timezone: 'UTC' },
);

import cron from 'node-cron';

import leaderboardService from '../services/leaderboard.service.js';
import questionService from '../services/question.service.js';
import quizService from '../services/quiz.service.js';

export const scheduleQuizzesJob = cron.schedule(
  '1 0 * * 0',
  async () => {
    console.log('Running Scheduled Task: Approve Next Week Questions...');
    await questionService.scheduleQuizzesJob();
  },
  { scheduled: true, timezone: 'UTC' },
);

export const makeQuizLiveTestJob = cron.schedule(
  '30 5 * * 5',
  async () => {
    console.log('Running Scheduled Task: Make Quiz Live...');
    await quizService.makeQuizLiveTest();
  },
  { scheduled: true, timezone: 'UTC' },
);

export const cleanWeeklyQuizJob = cron.schedule(
  '1 0 * * 5',
  async () => {
    console.log('Running Scheduled Task: Clean Weekly Quiz...');
    await quizService.cleanWeeklyQuiz();
  },
  { scheduled: true, timezone: 'UTC' },
);

export const leaderboardResetJob = cron.schedule(
  '1 0 1 * *',
  async () => {
    console.log('Running Scheduled Task: Reset Leaderboard...');
    await leaderboardService.leaderboardReset();
  },
  { scheduled: true, timezone: 'UTC' },
);
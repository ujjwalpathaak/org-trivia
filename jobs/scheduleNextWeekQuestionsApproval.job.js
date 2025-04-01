import cron from 'node-cron';

import {scheduleQuizzesJob} from '../services/question.service.js';

export const scheduleQuizzesJobCron = cron.schedule(
  '1 0 * * 0',
  async () => {
    console.log('Running Scheduled Task: Approve Next Week Questions...');
    await scheduleQuizzesJob();
  },
  { scheduled: true, timezone: 'UTC' },
);

export const makeQuizLiveTestJobCron = cron.schedule(
  '30 5 * * 5',
  async () => {
    console.log('Running Scheduled Task: Make Quiz Live...');
    await makeQuizLiveTest();
  },
  { scheduled: true, timezone: 'UTC' },
);

export const cleanWeeklyQuizJobCron = cron.schedule(
  '1 0 * * 5',
  async () => {
    console.log('Running Scheduled Task: Clean Weekly Quiz...');
    await cleanWeeklyQuiz();
  },
  { scheduled: true, timezone: 'UTC' },
);

export const leaderboardResetJobCron = cron.schedule(
  '1 0 1 * *',
  async () => {
    console.log('Running Scheduled Task: Reset Leaderboard...');
    await leaderboardReset();
  },
  { scheduled: true, timezone: 'UTC' },
);

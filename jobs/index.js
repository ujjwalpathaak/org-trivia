import cron from 'node-cron';

import { scheduleNextMonthQuizzesJob } from '../services/question.service.js';
import { cleanUpQuizzesController, makeQuizLiveController } from '../controllers/quiz.controller.js';
import { resetLeaderboardController } from '../controllers/org.controller.js';
import { generateCAnITQuestionsController } from '../controllers/question.controller.js';

function isTodayAfterLastFriday() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();

  const lastDay = new Date(Date.UTC(year, month + 1, 0));
  let lastFriday = new Date(lastDay);

  while (lastFriday.getUTCDay() !== 5) { // 5 = Friday
    lastFriday.setUTCDate(lastFriday.getUTCDate() - 1);
  }

  const afterLastFriday = new Date(lastFriday);
  afterLastFriday.setUTCDate(lastFriday.getUTCDate() + 1);

  return (
    now.getUTCFullYear() === afterLastFriday.getUTCFullYear() &&
    now.getUTCMonth() === afterLastFriday.getUTCMonth() &&
    now.getUTCDate() === afterLastFriday.getUTCDate()
  );
}

const scheduleNextMonthQuizzes = cron.schedule(
  '1 0 * * *', // Every day at 00:01 UTC
  async () => {
    if (isTodayAfterLastFriday()) {
      console.log('Running Scheduled Task: Schedule Next Month Quizzes...');
      await scheduleNextMonthQuizzesJob();
    } else {
      console.log('ScheduleNextMonthQuizzes: Skipping today. Not the day after last Friday.');
    }
  },
  { scheduled: true, timezone: 'UTC' },
);

const makeQuizLiveTestJobCron = cron.schedule(
  '1 0 * * 5', // Every Friday at 00:01 UTC
  async () => {
    console.log('Running Scheduled Task: Make Quiz Live...');
    await makeQuizLiveController();
  },
  { scheduled: true, timezone: 'UTC' },
);

const cleanWeeklyQuizJobCron = cron.schedule(
  '1 0 * * 6', // Every Saturday at 00:01 UTC
  async () => {
    console.log('Running Scheduled Task: Clean Weekly Quiz...');
    await cleanUpQuizzesController();
  },
  { scheduled: true, timezone: 'UTC' },
);

const generateCAnITQuestionsJobCron = cron.schedule(
  '1 0 * * 4', // Every Thursday at 00:01 UTC
  async () => {
    console.log('Running Scheduled Task: Make Quiz Live...');
    await generateCAnITQuestionsController();
  },
  { scheduled: true, timezone: 'UTC' },
);

const leaderboardResetJobCron = cron.schedule(
  '1 0 * * *', // Every day at 00:01 UTC
  async () => {
    if (isTodayAfterLastFriday()) {
      console.log('Running Scheduled Task: Reset Leaderboard...');
      await resetLeaderboardController();
    } else {
      console.log('LeaderboardReset: Skipping today. Not the day after last Friday.');
    }
  },
  { scheduled: true, timezone: 'UTC' },
);

export const startJobs = () => {
  console.log('Starting cron jobs...');
  scheduleNextMonthQuizzes.start();
  makeQuizLiveTestJobCron.start();
  cleanWeeklyQuizJobCron.start();
  generateCAnITQuestionsJobCron.start();
  leaderboardResetJobCron.start();
};

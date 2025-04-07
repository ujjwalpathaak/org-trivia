import cron from 'node-cron';

import { scheduleNextMonthQuizzesJob } from '../services/question.service.js';

const scheduleNextMonthQuizzes = cron.schedule(
  '1 0 * * 0',
  async () => {
    console.log('Running Scheduled Task: Schedule Next Month Quizzes...');
    await scheduleNextMonthQuizzesJob();
  },
  { scheduled: true, timezone: 'UTC' },
);

// const makeQuizLiveTestJobCron = cron.schedule(
//   '30 5 * * 5',
//   async () => {
//     console.log('Running Scheduled Task: Make Quiz Live...');
//     await makeQuizLiveTest();
//   },
//   { scheduled: true, timezone: 'UTC' },
// );

// const generateCAnITQuestionsJobCron = cron.schedule(
//   '30 5 * * 4',
//   async () => {
//     console.log('Running Scheduled Task: Make Quiz Live...');
//     await generateCAnITQuestionsJob();
//   },
//   { scheduled: true, timezone: 'UTC' },
// );

// const cleanWeeklyQuizJobCron = cron.schedule(
//   '1 0 * * 5',
//   async () => {
//     console.log('Running Scheduled Task: Clean Weekly Quiz...');
//     await cleanWeeklyQuiz();
//   },
//   { scheduled: true, timezone: 'UTC' },
// );

// const leaderboardResetJobCron = cron.schedule(
//   '1 0 1 * *',
//   async () => {
//     console.log('Running Scheduled Task: Reset Leaderboard...');
//     await leaderboardReset();
//   },
//   { scheduled: true, timezone: 'UTC' },
// );

export const startJobs = () => {
  console.log('Starting cron jobs...');
  scheduleNextMonthQuizzes.start();
  // makeQuizLiveTestJobCron.start();
  // cleanWeeklyQuizJobCron.start();
  // leaderboardResetJobCron.start();
};

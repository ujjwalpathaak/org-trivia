import {
  cleanWeeklyQuizJobCron,
  leaderboardResetJobCron,
  makeQuizLiveTestJobCron,
  scheduleQuizzesJobCron,
} from './scheduleNextWeekQuestionsApproval.job.js';

export const startJobs = () => {
  console.log('Starting cron jobs...');
  scheduleQuizzesJobCron.start();
  makeQuizLiveTestJobCron.start();
  cleanWeeklyQuizJobCron.start();
  leaderboardResetJobCron.start();
};

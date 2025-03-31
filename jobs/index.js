import {
  cleanWeeklyQuizJob,
  leaderboardResetJob,
  makeQuizLiveTestJob,
  scheduleQuizzesJob,
} from './scheduleNextWeekQuestionsApproval.job.js';

export const startJobs = () => {
  console.log('Starting cron jobs...');
  scheduleQuizzesJob.start();
  makeQuizLiveTestJob.start();
  cleanWeeklyQuizJob.start();
  leaderboardResetJob.start();
};

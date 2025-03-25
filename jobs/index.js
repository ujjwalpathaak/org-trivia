import {
  cleanWeeklyQuizJob,
  leaderboardResetJob,
  makeQuizLiveTestJob,
  scheduleNextWeekQuestionsApprovalJob,
} from './scheduleNextWeekQuestionsApproval.job.js';

export const startJobs = () => {
  console.log('Starting cron jobs...');
  scheduleNextWeekQuestionsApprovalJob.start();
  makeQuizLiveTestJob.start();
  cleanWeeklyQuizJob.start();
  leaderboardResetJob.start();
};

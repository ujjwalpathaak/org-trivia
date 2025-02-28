import { scheduleNextWeekQuestionsApproval } from './scheduleNextWeekQuestionsApproval.job.js';

export const startJobs = () => {
  console.log('Starting cron jobs...');
  scheduleNextWeekQuestionsApproval.start();
};

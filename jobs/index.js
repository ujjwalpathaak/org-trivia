import { scheduleNextWeekQuestionsApprovalJob } from './scheduleNextWeekQuestionsApproval.job.js';

export const startJobs = () => {
  console.log('Starting cron jobs...');
  scheduleNextWeekQuestionsApprovalJob.start();
};

import { scheduleQuestionsJob } from './scheduleQuestions.job.js';

export const startJobs = () => {
  console.log('Starting cron jobs...');
  scheduleQuestionsJob.start();
};

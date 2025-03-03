import cron from 'node-cron';
import QuestionRepository from '../repositories/question.repository.js';
import QuestionService from '../services/question.service.js';

const questionService = new QuestionService(new QuestionRepository());

export const scheduleNextWeekQuestionsApproval = cron.schedule(
  '1 0 * * 5',
  async () => {
    console.log('Running Scheduled Task: Next Week Questions Approval...');

    await questionService.scheduleNextWeekQuestionsApproval();
    // .then(() => console.log('Successfully scheduled new questions for all organizations.'))
    // .catch((error) => console.error('Error scheduling questions:', error));
  },
  { scheduled: true, timezone: 'UTC' },
);

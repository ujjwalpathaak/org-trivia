import cron from 'node-cron';
import QuestionRepository from '../repositories/question.repository.js';
import QuestionService from '../services/question.service.js';

const questionService = new QuestionService(new QuestionRepository());

export const scheduleNextWeekQuestionsApproval = cron.schedule(
  '01 00 * * 5',
  async () => {
    console.log('Running Schedule Next Week Questions Approval...');

    try {
      await questionService.scheduleNextWeekQuestionsApproval();
      console.log(
        'Successfully scheduled new questions for all organizations.',
      );
    } catch (error) {
      console.error('Error scheduling questions:', error);
    }
  },
);

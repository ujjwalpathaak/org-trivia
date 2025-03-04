import cron from 'node-cron';
import QuestionRepository from '../repositories/question.repository.js';
import QuestionService from '../services/question.service.js';
import QuizService from '../services/quiz.service.js';
import QuizRepository from '../repositories/quiz.repository.js';

const quizService = new QuizService(new QuizRepository());
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

export const cleanWeeklyQuiz = cron.schedule(
  '1 0 * * 7',
  async () => {
    console.log('Running Scheduled Task: Clean Week Quiz...');

    await quizService.cleanWeeklyQuizQuestions();
    // .then(() => console.log('Successfully scheduled new questions for all organizations.'))
    // .catch((error) => console.error('Error scheduling questions:', error));
  },
  { scheduled: true, timezone: 'UTC' },
);

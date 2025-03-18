import cron from 'node-cron';
import QuestionRepository from '../repositories/question.repository.js';
import QuestionService from '../services/question.service.js';
import QuizService from '../services/quiz.service.js';
import QuizRepository from '../repositories/quiz.repository.js';
import LeaderboardService from '../services/leaderboard.service.js';
import LeaderboardRepository from '../repositories/leaderboard.respository.js';
import OrgRepository from '../repositories/org.repository.js';
import EmployeeRepository from '../repositories/employee.repository.js';

const quizService = new QuizService(
  new QuizRepository(),
  new EmployeeRepository(),
  new QuestionRepository(),
  new OrgRepository(),
);
const questionService = new QuestionService(new QuestionRepository());
const leaderboardService = new LeaderboardService(
  new LeaderboardRepository(),
  new OrgRepository(),
);

export const scheduleNextWeekQuestionsApproval = cron.schedule(
  '5 0 * * 6',
  async () => {
    console.log('Running Scheduled Task: Next Week Questions Approval...');

    await questionService.scheduleNextWeekQuestionsApproval();
  },
  { scheduled: true, timezone: 'UTC' },
);

export const cleanUpWeeklyQuiz = cron.schedule(
  '1 0 * * 5',
  async () => {
    console.log('Running Scheduled Task: Clean Up Weekly Quiz...');

    await quizService.cleanUpWeeklyQuiz();
  },
  { scheduled: true, timezone: 'UTC' },
);

export const makeWeeklyQuizLive = cron.schedule(
  '1 0 * * 5',
  async () => {
    console.log('Running Scheduled Task: Make Weekly Quiz Live...');

    await quizService.makeWeeklyQuizLive();
  },
  { scheduled: true, timezone: 'UTC' },
);

export const resetLeaderboard = cron.schedule(
  '1 0 * * 5',
  async () => {
    console.log('Running Scheduled Task: Reset Leaderboard...');

    await leaderboardService.resetLeaderboard();
  },
  { scheduled: true, timezone: 'UTC' },
);

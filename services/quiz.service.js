import {
  isWeeklyQuizGiven,
  updateEmployeeStreaksAndMarkAllEmployeesAsQuizNotGiven,
  awardStreakBadges,
} from '../repositories/employee.repository.js';
import {
  getQuizStatus,
  cancelLiveQuiz,
  findQuiz,
  makeWeeklyQuizLive,
  markAllQuizAsExpired,
  getScheduledQuizzes,
} from '../repositories/quiz.repository.js';
import { dropWeeklyQuestionCollection } from '../repositories/question.repository.js';

export const getWeeklyQuizStatusService = async (orgId, employeeId) => {
  const [quiz, employee] = await Promise.all([
    getQuizStatus(orgId),
    isWeeklyQuizGiven(employeeId),
  ]);

  if (quiz?.status === 'cancelled') {
    return 0; // cancelled
  } else if (quiz?.status === 'live' && !employee.quizGiven) {
    return 1; // live
  } else if (quiz?.status === 'live' && employee.quizGiven) {
    return 2; // already given
  } else {
    return 3; // upcoming
  }
};

export const cancelLiveQuizService = async (quizId) => {
  await cancelLiveQuiz(quizId);
  return { message: 'Live quiz cancelled' };
};

export const getWeeklyQuizService = async (quizId) => {
  return await findQuiz(quizId);
};

export const makeWeeklyQuizLiveService = async () => {
  await makeWeeklyQuizLive();
  return { message: 'All weekly quizzes are live' };
};

export const cleanUpWeeklyQuizService = async () => {
  await Promise.all([
    markAllQuizAsExpired(),
    updateEmployeeStreaksAndMarkAllEmployeesAsQuizNotGiven(),
    dropWeeklyQuestionCollection(),
  ]);

  await awardStreakBadges();

  return { message: 'Cleaned up weekly quiz.' };
};

export const getScheduledQuizzesService = async (orgId) => {
  return await getScheduledQuizzes(orgId);
};

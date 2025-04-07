import {
  awardStreakBadges,
  isWeeklyQuizGiven,
  updateEmployeeStreaksAndMarkAllEmployeesAsQuizNotGiven,
} from '../repositories/employee.repository.js';
import { dropWeeklyQuestionCollection } from '../repositories/question.repository.js';
import {
  cancelLiveQuiz,
  findQuiz,
  getQuizStatus,
  getScheduledQuizzes,
  makeWeeklyQuizLive,
  markAllQuizAsExpired,
} from '../repositories/quiz.repository.js';
import { rollbackWeeklyQuizScores } from '../repositories/result.repository.js';

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
  await rollbackWeeklyQuizScores(quizId);
  return { message: 'Live quiz cancelled' };
};

export const getWeeklyQuizService = async (quizId) => {
  return await findQuiz(quizId);
};

// export const isCAnITQuizOverlappingService = async (
//   orgId,
//   companyCurrentAffairsTimeline,
//   quizId,
// ) => {
//   const quiz = findQuiz(quizId);
//   const days = companyCurrentAffairsTimeline * 7;
//   const quizDate = new Date(quiz?.scheduledDate);

//   const lastQuiz = await lastQuizByGenre(orgId, 'CANIT');

//   if (!lastQuiz?.scheduledDate) {
//     return false;
//   }

//   const lastQuizDate = new Date(lastQuiz.scheduledDate);

//   return Math.abs((quizDate - lastQuizDate) / (1000 * 60 * 60 * 24)) < days;
// };

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

export const getScheduledQuizzesService = async (orgId, month, year) => {
  return await getScheduledQuizzes(orgId, month, year);
};

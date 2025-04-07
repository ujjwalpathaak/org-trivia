import { dbConnection } from '../Database.js';
import { getMonthAndYear, mergeUserAnswersAndCorrectAnswers } from '../middleware/utils.js';
import { getWeeklyQuizCorrectAnswersService } from './question.service.js';
import {
  awardStreakBadges,
  isWeeklyQuizGiven,
  updateEmployeeStreaksAndMarkAllEmployeesAsQuizNotGiven,
  updateWeeklyQuizScore
} from '../repositories/employee.repository.js';
import { dropWeeklyQuestionCollection } from '../repositories/question.repository.js';
import {
  cancelLiveQuiz,
  findQuiz,
  getQuizStatus,
  getScheduledQuizzes,
  makeWeeklyQuizLive,
  markAllQuizAsExpired,
  findLiveQuizByOrgId,
  getLiveQuizQuestionsByOrgId
} from '../repositories/quiz.repository.js';
import {
  rollbackWeeklyQuizScores,
  submitWeeklyQuizAnswers as submitAnswers
} from '../repositories/result.repository.js';
import { updateLeaderboard } from '../repositories/leaderboard.respository.js';

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

export async function getWeeklyQuizLiveQuestions(orgId, quizGenre) {
  const questions = await getLiveQuizQuestionsByOrgId(orgId);
  return {
    weeklyQuizQuestions: questions || [],
    quizId: questions[0]?.quizId || null,
  };
}

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

const calculateWeeklyQuizScore = (userAnswers, correctAnswers) => {
  const correctAnswerMap = new Map(
    correctAnswers.map(({ _id, answer }) => [_id.toString(), answer]),
  );

  return userAnswers.reduce(
    (score, { questionId, answer }) =>
      score + (Object.is(correctAnswerMap.get(questionId), answer) ? 10 : 0),
    0,
  );
};

export const submitWeeklyQuizAnswersService = async (
  userAnswers,
  employeeId,
  orgId,
  quizId,
) => {
  const session = await dbConnection.startSession();
  session.startTransaction();

  try {
    const correctAnswers = await getWeeklyQuizCorrectAnswersService(quizId);
    const points = calculateWeeklyQuizScore(userAnswers, correctAnswers);
    const quiz = await findLiveQuizByOrgId(orgId);
    if (!quiz) {
      console.error('❌ No active quiz found for org:', orgId);
      throw new Error('No active quiz found for this organization.');
    }
    const data = await updateWeeklyQuizScore(employeeId, points, session);
    if (!data) {
      console.warn('⚠️ Quiz already submitted by employee:', employeeId);
      throw new Error('Error updating employee score - quiz already given.');
    }
    const [month, year] = getMonthAndYear();
    await updateLeaderboard(
      orgId,
      employeeId,
      data.score,
      month,
      year,
      session,
    );
    const mergedUserAnswersAndCorrectAnswers =
      mergeUserAnswersAndCorrectAnswers(correctAnswers, userAnswers);
    await submitAnswers(
      employeeId,
      orgId,
      quizId,
      data.score,
      points,
      quiz.genre,
      mergedUserAnswersAndCorrectAnswers,
      session,
    );
    await session.commitTransaction();
    session.endSession();
    return { success: true, score: data.score, points };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('❌ Transaction aborted due to error:', error.message);
    throw new Error(`Failed to submit quiz: ${error.message}`);
  }
};

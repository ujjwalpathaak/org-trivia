import { dbConnection } from '../Database.js';

import {
  getMonthAndYear,
  mergeUserAnswersAndCorrectAnswers,
} from '../middleware/utils.js';

import {
  awardStreakBadges,
  isWeeklyQuizGiven,
  updateEmployeeStreaksAndMarkAllEmployeesAsQuizNotGiven,
  updateWeeklyQuizScore,
} from '../repositories/employee.repository.js';

import { updateLeaderboard } from '../repositories/leaderboard.respository.js';

import { dropWeeklyQuestionCollection, getCorrectWeeklyQuizAnswers } from '../repositories/question.repository.js';

import {
  cancelLiveQuiz,
  findLiveQuizByOrgId,
  getLiveQuizQuestionsByOrgId,
  getQuizStatus,
  getScheduledQuizzes,
  makeWeeklyQuizLive,
  markAllQuizAsExpired,
} from '../repositories/quiz.repository.js';

import {
  rollbackWeeklyQuizScores,
  submitWeeklyQuizAnswers,
} from '../repositories/result.repository.js';

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

export async function getWeeklyQuizLiveQuestionsService(orgId, quizGenre) {
  const questions = await getLiveQuizQuestionsByOrgId(orgId);
  return {
    weeklyQuizQuestions: questions || [],
    quizId: questions[0]?.quizId || null,
  };
}

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
    const correctAnswers = await getCorrectWeeklyQuizAnswers(quizId);
    const points = calculateWeeklyQuizScore(userAnswers, correctAnswers);
    const quiz = await findLiveQuizByOrgId(orgId);
    if (!quiz) {
      throw new Error('No active quiz found for this organization.');
    }
    const data = await updateWeeklyQuizScore(employeeId, points, session);
    if (!data) {
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
    await submitWeeklyQuizAnswers(
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
    throw new Error(`Failed to submit quiz: ${error.message}`);
  }
};

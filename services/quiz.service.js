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
import {
  rollbackLeaderboardScores,
  updateLeaderboard,
} from '../repositories/leaderboard.respository.js';
import { changeOrgQuestionsState } from '../repositories/org.repository.js';
import {
  dropWeeklyQuestionForExpiredQuizzes,
  getCorrectWeeklyQuizAnswers,
} from '../repositories/question.repository.js';
import {
  allowScheduledQuiz,
  cancelLiveQuiz,
  cancelScheduledQuiz,
  findLiveQuizByOrgId,
  getLiveQuizQuestionsByOrgId,
  getQuizStatus,
  getScheduledQuizzes,
  makeQuizLive,
  markAllLiveQuizAsExpired,
} from '../repositories/quiz.repository.js';
import {
  rollbackWeeklyQuizScores,
  submitWeeklyQuizAnswers,
} from '../repositories/result.repository.js';

/**
 * Gets the status of a weekly quiz for an employee
 * @param {string} orgId - The ID of the organization
 * @param {string} employeeId - The ID of the employee
 * @param {Date} date - The date to check the quiz status for
 * @returns {Promise<Object>} Object containing quiz status information
 */
export const getWeeklyQuizStatusService = async (orgId, employeeId, date) => {
  const today = date ? new Date(date) : new Date();
  today.setUTCHours(0, 0, 0, 0);

  const [quiz, employee] = await Promise.all([
    getQuizStatus(orgId, today),
    isWeeklyQuizGiven(employeeId),
  ]);

  if (!quiz) return { status: -1, genre: 'No Quiz Scheduled Today' };

  if (quiz?.status === 'cancelled') {
    return { status: 0, genre: quiz.genre }; // cancelled
  } else if (quiz?.status === 'expired') {
    return { status: 4, genre: quiz.genre }; // expired
  } else if (quiz?.status === 'live' && !employee.quizGiven) {
    return { status: 1, genre: quiz.genre }; // live
  } else if (quiz?.status === 'live' && employee.quizGiven) {
    return { status: 2, genre: quiz.genre }; // already given
  } else {
    return { status: 3, genre: quiz.genre }; // upcoming
  }
};

/**
 * Cancels a scheduled quiz
 * @param {string} quizId - The ID of the quiz to cancel
 * @param {string} orgId - The ID of the organization
 * @returns {Promise<Object>} Response object containing status and message
 */
export const cancelScheduledQuizSerivce = async (quizId, orgId) => {
  const quiz = await cancelScheduledQuiz(quizId);
  await changeOrgQuestionsState(quiz.genre, orgId, 0);

  return { message: 'Live quiz cancelled' };
};

/**
 * Cancels a live quiz
 * @param {string} quizId - The ID of the quiz to cancel
 * @param {string} orgId - The ID of the organization
 * @returns {Promise<Object>} Response object containing status and message
 */
export const cancelLiveQuizService = async (quizId, orgId) => {
  const quiz = await cancelLiveQuiz(quizId);

  Promise.all([
    await changeOrgQuestionsState(quiz.genre, orgId, 2),
    await rollbackWeeklyQuizScores(quizId),
    await rollbackLeaderboardScores(quizId, quiz.scheduledDate),
  ]);

  return { message: 'Live quiz cancelled' };
};

/**
 * Allows a scheduled quiz to proceed
 * @param {string} quizId - The ID of the quiz to allow
 * @returns {Promise<Object>} Response object containing status and message
 */
export const allowScheduledQuizSerivce = async (quizId) => {
  await allowScheduledQuiz(quizId);
  return { message: 'Quiz scheduled' };
};

/**
 * Gets the live questions for a weekly quiz
 * @param {string} orgId - The ID of the organization
 * @returns {Promise<Array>} Array of quiz questions
 */
export async function getWeeklyQuizLiveQuestionsService(orgId) {
  const questions = await getLiveQuizQuestionsByOrgId(orgId);
  return {
    weeklyQuizQuestions: questions || [],
    quizId: questions[0]?.quizId || null,
  };
}

/**
 * Makes a quiz live
 * @param {Date} date - The date to make the quiz live for
 * @returns {Promise<Object>} Response object containing status and message
 */
export const makeQuizLiveService = async (date) => {
  date = date ? new Date(date) : new Date();

  date.setUTCHours(0, 0, 0, 0);

  await makeQuizLive(date);
  return { message: 'All weekly quizzes are live' };
};

/**
 * Cleans up expired quizzes and updates related data
 * @returns {Promise<void>}
 */
export const cleanUpQuizzesService = async () => {
  const quizIds = await markAllLiveQuizAsExpired();

  await Promise.all([
    updateEmployeeStreaksAndMarkAllEmployeesAsQuizNotGiven(),
    dropWeeklyQuestionForExpiredQuizzes(quizIds),
  ]);

  await awardStreakBadges();

  return { message: 'Cleaned up weekly quiz.' };
};

/**
 * Gets all scheduled quizzes for an organization
 * @param {string} orgId - The ID of the organization
 * @param {number} month - The month to get quizzes for (0-11)
 * @param {number} year - The year to get quizzes for
 * @returns {Promise<Array>} Array of scheduled quizzes
 */
export const getScheduledQuizzesService = async (
  orgId,
  month = new Date().getUTCMonth(),
  year = new Date().getUTCFullYear(),
) => {
  const startDate = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
  const endDate = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

  return await getScheduledQuizzes(orgId, startDate, endDate);
};

/**
 * Calculates the score for a weekly quiz
 * @param {Array} userAnswers - Array of answers submitted by the user
 * @param {Array} correctAnswers - Array of correct answers
 * @returns {Object} Object containing score and points
 */
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

/**
 * Submits answers for a weekly quiz
 * @param {Array} userAnswers - Array of answers submitted by the user
 * @param {string} employeeId - The ID of the employee
 * @param {string} orgId - The ID of the organization
 * @param {string} quizId - The ID of the quiz
 * @returns {Promise<Object>} Response object containing status and message
 */
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

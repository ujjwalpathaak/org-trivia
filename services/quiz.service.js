import { dbConnection } from '../Database.js';
import {
  getMonthAndYear,
  mergeUserAnswersAndCorrectAnswers,
} from '../middleware/utils.js';
import { getValue, setValue } from '../Redis.js';
import {
  awardStreakBadges,
  isWeeklyQuizGiven,
  rollforwardWeeklyQuizScores,
  updateEmployeeStreaksAndMarkAllEmployeesAsQuizNotGiven,
  updateWeeklyQuizScore,
} from '../repositories/employee.repository.js';
import {
  rollforwardLeaderboardScores,
  updateLeaderboard,
} from '../repositories/leaderboard.respository.js';
import { changeOrgQuestionsState } from '../repositories/org.repository.js';
import {
  cancelQuiz,
  findLiveQuizByOrgId,
  getCorrectQuizAnswers,
  getLiveQuizQuestionsByOrgId,
  getQuizStatus,
  getScheduledQuizzes,
  makeQuizLive,
  markAllLiveQuizAsExpired,
  restoreQuiz,
  resumeLiveQuiz,
  suspendLiveQuiz,
} from '../repositories/quiz.repository.js';
import {
  findOrgResults,
  rollbackLeaderboardScores,
  rollbackWeeklyQuizScores,
  submitWeeklyQuizAnswers,
} from '../repositories/result.repository.js';
import { allowQuizQuestionGenerationWorkflow } from './question.service.js';

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
  } else if (quiz?.status === 'suspended') {
    return { status: 5, genre: quiz.genre }; // suspended
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

export const cancelQuizService = async (quizId, orgId) => {
  const quiz = await cancelQuiz(quizId);
  const quizQuestionsCount = quiz.questions.length;
  if (quizQuestionsCount > 0)
    changeOrgQuestionsState(quiz.genre, orgId, 0, quiz.questions);

  return { message: 'Scheduled Quiz Cancelled' };
};

export const suspendLiveQuizService = async (quizId, orgId) => {
  const quiz = await suspendLiveQuiz(quizId);
  const orgResults = await findOrgResults(quizId);
  const today = new Date();
  const endOfDay = new Date(today);
  endOfDay.setUTCHours(23, 59, 59, 999);
  const secondsUntilEndOfDay = Math.floor((endOfDay - today) / 1000);

  await setValue(`org:${orgId}:orgResults`, orgResults, secondsUntilEndOfDay);

  Promise.all([
    await rollbackWeeklyQuizScores(quizId),
    await rollbackLeaderboardScores(quizId, quiz.scheduledDate),
  ]);

  return { message: 'Live quiz cancelled' };
};

export const resumeLiveQuizService = async (quizId, orgId) => {
  await resumeLiveQuiz(quizId);

  const orgResults = await getValue(`org:${orgId}:orgResults`);
  const unescaped = orgResults.replace(/\\"/g, '"');
  const orgResultsParsed = JSON.parse(unescaped);
  const employeeResults = orgResultsParsed.map((result) => {
    return {
      employeeId: result.employeeId,
      points: result.points,
    };
  });

  Promise.all([
    await rollforwardWeeklyQuizScores(employeeResults),
    await rollforwardLeaderboardScores(employeeResults),
  ]);

  return { message: 'Live quiz allowed' };
};

export const restoreQuizService = async (quizId, orgId) => {
  const quiz = await restoreQuiz(quizId);
  const response = await allowQuizQuestionGenerationWorkflow(quiz, orgId);
  if (response?.status === 400) {
    return response;
  }
  return { message: 'Quiz allowed' };
};

export async function getWeeklyQuizLiveQuestionsService(orgId) {
  const questions = await getLiveQuizQuestionsByOrgId(orgId);
  return {
    weeklyQuizQuestions: questions || [],
    quizId: questions[0]?.quizId || null,
  };
}

export const makeQuizLiveService = async (date) => {
  date = date ? new Date(date) : new Date();

  date.setUTCHours(0, 0, 0, 0);

  await makeQuizLive(date);
  return { message: 'All weekly quizzes are live' };
};

export const cleanUpQuizzesService = async () => {
  await markAllLiveQuizAsExpired();
  await updateEmployeeStreaksAndMarkAllEmployeesAsQuizNotGiven();
  await awardStreakBadges();

  return { message: 'Cleaned up weekly quiz.' };
};

export const getScheduledQuizzesService = async (
  orgId,
  month = new Date().getUTCMonth(),
  year = new Date().getUTCFullYear(),
) => {
  const startDate = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
  const endDate = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

  return await getScheduledQuizzes(orgId, startDate, endDate);
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
    const correctAnswers = await getCorrectQuizAnswers(quizId);
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

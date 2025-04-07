import { dbConnection } from '../Database.js';
import {
  getMonthAndYear,
  mergeUserAnswersAndCorrectAnswers,
} from '../middleware/utils.js';
import { updateWeeklyQuizScore } from '../repositories/employee.repository.js';
import { updateLeaderboard } from '../repositories/leaderboard.respository.js';
import { findLiveQuizByOrgId } from '../repositories/quiz.repository.js';
import {
  getEmployeePastResults,
  submitWeeklyQuizAnswers as submitAnswers,
} from '../repositories/result.repository.js';
import { getWeeklyQuizCorrectAnswersService } from './question.service.js';

export const calculateWeeklyQuizScore = (userAnswers, correctAnswers) => {
  const correctAnswerMap = new Map(
    correctAnswers.map(({ _id, answer }) => [_id.toString(), answer]),
  );

  return userAnswers.reduce(
    (score, { questionId, answer }) =>
      score + (Object.is(correctAnswerMap.get(questionId), answer) ? 10 : 0),
    0,
  );
};

export const getEmployeePastResultsService = async (employeeId, page, size) => {
  return await getEmployeePastResults(employeeId, page, size);
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

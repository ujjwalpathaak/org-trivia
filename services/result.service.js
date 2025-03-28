import { dbConnection } from '../Database.js';
import {
  getMonthAndYear,
  mergeUserAnswersAndCorrectAnswers,
} from '../middleware/utils.js';
import employeeRepository from '../repositories/employee.repository.js';
import leaderboardRepository from '../repositories/leaderboard.respository.js';
import quizRepository from '../repositories/quiz.repository.js';
import resultRepository from '../repositories/result.repository.js';
import questionService from './question.service.js';

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

const getEmployeePastResultsService = async (employeeId, page, size) => {
  return await resultRepository.getEmployeePastResults(employeeId, page, size);
};

const submitWeeklyQuizAnswersService = async (
  userAnswers,
  employeeId,
  orgId,
  quizId,
) => {
  const session = await dbConnection.startSession();
  session.startTransaction();

  try {
    const correctAnswers =
      await questionService.getWeeklyQuizCorrectAnswersService(orgId, quizId);
    const points = calculateWeeklyQuizScore(userAnswers, correctAnswers);

    const quiz = await quizRepository.findLiveQuizByOrgId(orgId);
    if (!quiz) {
      throw new Error('No active quiz found for this organization.');
    }

    const data = await employeeRepository.updateWeeklyQuizScore(
      employeeId,
      points,
      session,
    );
    if (!data) {
      throw new Error('Error updating employee score - quiz already given.');
    }

    const [month, year] = getMonthAndYear();

    await leaderboardRepository.updateLeaderboard(
      orgId,
      employeeId,
      data.score,
      month,
      year,
      session,
    );

    const mergedUserAnswersAndCorrectAnswers =
      mergeUserAnswersAndCorrectAnswers(correctAnswers, userAnswers);

    await resultRepository.submitWeeklyQuizAnswers(
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

export default {
  calculateWeeklyQuizScore,
  getEmployeePastResultsService,
  submitWeeklyQuizAnswersService,
};

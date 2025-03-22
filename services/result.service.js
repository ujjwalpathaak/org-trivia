import {
  getMonthAndYear,
  mergeUserAnswersAndCorrectAnswers,
} from '../middleware/utils.js';
import employeeRepository from '../repositories/employee.repository.js';
import leaderboardRepository from '../repositories/leaderboard.respository.js';
import quizRepository from '../repositories/quiz.repository.js';
import resultRepository from '../repositories/result.repository.js';
import questionService from './question.service.js';

const calculateWeeklyQuizScore = async (userAnswers, correctAnswers) => {
  let weeklyQuizScore = 0;

  userAnswers.forEach(({ questionId, answer }) => {
    const correctAnswer = correctAnswers.find(
      (correctAnswer) => correctAnswer._id.toString() === questionId,
    );

    if (correctAnswer && answer === correctAnswer.answer) {
      weeklyQuizScore += 10;
    }
  });

  return weeklyQuizScore;
};

const getEmployeePastResults = async (employeeId, page, size) => {
  return await resultRepository.getEmployeePastResults(employeeId, page, size);
};

const submitWeeklyQuizAnswers = async (
  userAnswers,
  employeeId,
  orgId,
  quizId,
) => {
  const correctAnswers = await questionService.getWeeklyQuizCorrectAnswers(
    orgId,
    quizId,
  );
  const points = await calculateWeeklyQuizScore(userAnswers, correctAnswers);

  const data = await employeeRepository.updateWeeklyQuizScore(
    employeeId,
    points,
  );

  if (!data) {
    return {
      success: false,
      message: 'Error updating employee score - quiz already given',
    };
  }

  const [month, year] = getMonthAndYear();

  await leaderboardRepository.updateLeaderboard(
    orgId,
    employeeId,
    data.score,
    month,
    year,
  );

  const mergedUserAnswersAndCorrectAnswers = mergeUserAnswersAndCorrectAnswers(
    correctAnswers,
    userAnswers,
  );
  const quiz = await quizRepository.findLiveQuizByOrgId(orgId);

  await resultRepository.submitWeeklyQuizAnswers(
    employeeId,
    orgId,
    quizId,
    data.multiplier,
    data.score,
    points,
    quiz.genre,
    mergedUserAnswersAndCorrectAnswers,
  );

  return {
    success: true,
    multiplier: data.multiplier,
    score: data.score,
    points,
  };
};

const fetchEmployeeScore = async (employeeId) => {
  const quiz = await quizRepository.getLiveQuizByEmployeeId(employeeId);
  return await resultRepository.getEmployeeScore(employeeId, quiz);
};

export default {
  calculateWeeklyQuizScore,
  getEmployeePastResults,
  submitWeeklyQuizAnswers,
  fetchEmployeeScore,
};

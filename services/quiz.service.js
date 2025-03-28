import employeeRepository from '../repositories/employee.repository.js';
import questionRepository from '../repositories/question.repository.js';
import quizRepository from '../repositories/quiz.repository.js';

const getWeeklyQuizStatusService = async (orgId, employeeId) => {
  const [quiz, employee] = await Promise.all([
    quizRepository.getQuizStatus(orgId),
    employeeRepository.isWeeklyQuizGiven(employeeId),
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

const cancelLiveQuizService = async (quizId) => {
  await quizRepository.cancelLiveQuiz(quizId);
  return { message: 'Live quiz cancelled' };
};

const makeWeeklyQuizLiveService = async () => {
  await quizRepository.makeWeeklyQuizLive();
  return { message: 'All weekly quizzes are live' };
};

const cleanUpWeeklyQuizService = async () => {
  await Promise.all([
    quizRepository.markAllQuizAsExpired(),
    employeeRepository.updateEmployeeStreaksAndMarkAllEmployeesAsQuizNotGiven(),
    questionRepository.dropWeeklyQuestionCollection(),
  ]);

  await employeeRepository.awardStreakBadges();

  return { message: 'Cleaned up weekly quiz.' };
};

export default {
  getWeeklyQuizStatusService,
  makeWeeklyQuizLiveService,
  cleanUpWeeklyQuizService,
  cancelLiveQuizService,
};

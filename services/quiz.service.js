import { getNextFridayDate, getTodayDate } from '../middleware/utils.js';
import employeeRepository from '../repositories/employee.repository.js';
import questionRepository from '../repositories/question.repository.js';
import quizRepository from '../repositories/quiz.repository.js';

const getWeeklyQuizStatus = async (orgId, employeeId) => {
  const [isWeeklyQuizLive, isWeeklyQuizCancelled, employee] = await Promise.all(
    [
      quizRepository.findLiveQuizByOrgId(orgId),
      quizRepository.isWeeklyQuizCancelled(orgId),
      employeeRepository.isWeeklyQuizGiven(employeeId),
    ],
  );

  if (isWeeklyQuizCancelled) {
    return {
      status: 'cancelled',
      state: 0,
      message: 'Weekly quiz has been cancelled',
    };
  } else if (isWeeklyQuizLive && !employee.quizGiven) {
    return {
      status: 'live',
      state: 1,
      message: 'Weekly quiz is live',
    };
  } else if (isWeeklyQuizLive && employee.quizGiven) {
    return {
      status: 'given',
      state: 2,
      message: 'Weekly quiz has been given',
    };
  } else {
    return {
      status: 'not live',
      state: 3,
      message: 'Weekly quiz is not live',
    };
  }
};

const scheduleNewWeeklyQuiz = async (orgId, genre) => {
  const dateNextFriday = getNextFridayDate();

  const existingWeeklyQuiz = await quizRepository.doesWeeklyQuizExist(
    orgId,
    dateNextFriday,
  );

  if (existingWeeklyQuiz) {
    return false;
  }

  const newWeeklyQuiz = await quizRepository.scheduleNewWeeklyQuiz(
    orgId,
    dateNextFriday,
    genre,
  );

  return newWeeklyQuiz || false;
};

const makeWeeklyQuizLive = async () => {
  const today = getTodayDate();
  await quizRepository.makeWeeklyQuizLive(today);
  return { message: 'All weekly quizzes are live' };
};

const makeQuizLiveTest = async () => {
  await quizRepository.makeQuizLiveTest();
  return { message: 'All weekly quizzes are live' };
};

const cleanUpWeeklyQuiz = async () => {
  await Promise.all([
    quizRepository.markAllQuizAsExpired(),
    employeeRepository.updateEmployeeStreaksAndMarkAllEmployeesAsQuizNotGiven(),
    questionRepository.dropWeeklyQuestionCollection(),
  ]);

  return { message: 'Cleaned up weekly quiz.' };
};

export default {
  getWeeklyQuizStatus,
  scheduleNewWeeklyQuiz,
  makeWeeklyQuizLive,
  makeQuizLiveTest,
  cleanUpWeeklyQuiz,
};

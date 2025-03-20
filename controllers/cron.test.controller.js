import quizService from '../services/quiz.service.js';
const makeQuizLiveTest = async (req, res, next) => {
  try {
    await quizService.makeQuizLiveTest();

    res.status(200).json({});
  } catch (error) {
    next(error);
  }
};

const cleanWeeklyQuiz = async (req, res, next) => {
  try {
    await quizService.cleanUpWeeklyQuiz();

    res.status(200).json({ message: 'Weekly quiz cleaned successfully' });
  } catch (error) {
    next(error);
  }
};

export default {
  makeQuizLiveTest,
  cleanWeeklyQuiz,
};

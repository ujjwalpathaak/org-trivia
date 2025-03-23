import quizService from '../services/quiz.service.js';
const makeWeeklyQuizLiveConroller = async (req, res, next) => {
  try {
    await quizService.makeWeeklyQuizLiveService();

    res.status(200).json({});
  } catch (error) {
    next(error);
  }
};

const cleanUpWeeklyQuizController = async (req, res, next) => {
  try {
    await quizService.cleanUpWeeklyQuizService();

    res.status(200).json({ message: 'Weekly quiz cleaned successfully' });
  } catch (error) {
    next(error);
  }
};

export default {
  makeWeeklyQuizLiveConroller,
  cleanUpWeeklyQuizController,
};

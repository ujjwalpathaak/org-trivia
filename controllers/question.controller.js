import questionService from '../services/question.service.js';
import quizService from '../services/quiz.service.js';

const addQuestionController = async (req, res, next) => {
  try {
    const { question } = req.body;
    const { employeeId } = req.data;
    const errors =
      await questionService.validateEmployeeQuestionSubmission(question);
    if (errors) {
      return res.status(400).json(errors);
    }

    const isQuestionAdded = await questionService.saveQuestion(
      question,
      employeeId,
    );
    if (!isQuestionAdded) {
      return res.status(404).json({ message: 'Not able to save question' });
    }

    res.status(200).json({ message: 'New question saved successfully' });
  } catch (error) {
    next(error);
  }
};

const getWeeklyQuizQuestionsController = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const { orgId } = req.data;
    if (!orgId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const quiz = await quizService.getWeeklyQuizService(quizId);

    if (!quiz || !quiz.status === 'scheduled') {
      return res
        .status(400)
        .json({ message: 'No questions scheduled till now' });
    }

    const weeklyQuestions = await questionService.getWeeklyQuestionsService(
      orgId,
      quiz._id,
    );
    const extraEmployeeQuestions =
      await questionService.getExtraEmployeeQuestions(
        orgId,
        quiz._id,
        quiz.genre,
      );
    if (!weeklyQuestions) {
      return res
        .status(400)
        .json({ message: 'No questions scheduled till now' });
    }

    res.status(200).json({ weeklyQuestions, extraEmployeeQuestions });
  } catch (error) {
    next(error);
  }
};

const scheduleQuizzesJobController = async (req, res, next) => {
  try {
    await questionService.scheduleQuizzesJob();
    res.json('Job running');
  } catch (error) {
    next(error);
  }
};

export default {
  addQuestionController,
  getWeeklyQuizQuestionsController,
  scheduleQuizzesJobController,
};

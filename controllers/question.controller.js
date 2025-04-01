import {
  validateEmployeeQuestionSubmission,
  saveQuestion,
  getWeeklyQuizQuestions,
  approveWeeklyQuizQuestionsService,
} from '../services/question.service.js';
import {
  getWeeklyQuizService,
  makeWeeklyQuizLiveService,
} from '../services/quiz.service.js';

export const addQuestionController = async (req, res, next) => {
  try {
    const { question } = req.body;
    const { employeeId } = req.data;
    const errors = await validateEmployeeQuestionSubmission(question);
    if (errors) {
      return res.status(400).json(errors);
    }

    const isQuestionAdded = await saveQuestion(question, employeeId);
    if (!isQuestionAdded) {
      return res.status(404).json({ message: 'Not able to save question' });
    }

    res.status(200).json({ message: 'Question added successfully' });
  } catch (error) {
    next(error);
  }
};

export const getWeeklyQuizQuestionsController = async (req, res, next) => {
  try {
    const { orgId } = req.data;
    if (!orgId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const weeklyQuizQuestions = await getWeeklyQuizQuestions(orgId);
    res.status(200).json(weeklyQuizQuestions);
  } catch (error) {
    next(error);
  }
};

export const approveWeeklyQuizQuestionsController = async (req, res, next) => {
  try {
    const { orgId } = req.data;
    const { questions, questionsToDelete } = req.body;
    if (!orgId || !questions) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    await approveWeeklyQuizQuestionsService(questions, questionsToDelete, orgId);
    res.status(200).json({ message: 'Questions marked as approved' });
  } catch (error) {
    next(error);
  }
};

export const scheduleQuizzesJobController = async (req, res, next) => {
  try {
    const { orgId } = req.data;
    if (!orgId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const quiz = await getWeeklyQuizService(orgId);
    if (!quiz) {
      return res.status(404).json({ message: 'No quiz found' });
    }

    await makeWeeklyQuizLiveService();
    res.status(200).json({ message: 'Quizzes scheduled successfully' });
  } catch (error) {
    next(error);
  }
};

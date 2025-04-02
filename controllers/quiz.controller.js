import {
  addLambdaCallbackQuestions,
  approveWeeklyQuizQuestionsService,
  getWeeklyQuizLiveQuestions,
} from '../services/question.service.js';
import {
  cancelLiveQuizService,
  cleanUpWeeklyQuizService,
  getScheduledQuizzesService,
  getWeeklyQuizService,
  getWeeklyQuizStatusService,
  makeWeeklyQuizLiveService,
} from '../services/quiz.service.js';

export const getWeeklyQuizStatusController = async (req, res, next) => {
  try {
    const { orgId, employeeId } = req.data;
    if (!orgId || !employeeId)
      return res.status(404).json({ message: 'Missing organizationId' });

    const weeklyQuizStatus = await getWeeklyQuizStatusService(
      orgId,
      employeeId,
    );

    res.status(200).json(weeklyQuizStatus);
  } catch (error) {
    next(error);
  }
};

export const getWeeklyQuizController = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const quiz = await getWeeklyQuizService(quizId);
    res.status(200).json(quiz);
  } catch (error) {
    next(error);
  }
};

export const makeWeeklyQuizLiveController = async (req, res, next) => {
  try {
    const result = await makeWeeklyQuizLiveService();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const cleanUpWeeklyQuizController = async (req, res, next) => {
  try {
    const result = await cleanUpWeeklyQuizService();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const cancelLiveQuizController = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const result = await cancelLiveQuizService(quizId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getScheduledQuizzesController = async (req, res, next) => {
  try {
    const { orgId } = req.data;
    const quizzes = await getScheduledQuizzesService(orgId);
    res.status(200).json(quizzes);
  } catch (error) {
    next(error);
  }
};

export const getWeeklyQuizLiveQuestionsController = async (req, res, next) => {
  try {
    const { orgId } = req.data;
    if (!orgId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const weeklyQuizQuestions = await getWeeklyQuizLiveQuestions(orgId);

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

    await approveWeeklyQuizQuestionsService(
      questions,
      questionsToDelete,
      orgId,
    );

    res.status(200).json({ message: 'Questions marked as approved' });
  } catch (error) {
    next(error);
  }
};

export const handleLambdaCallbackController = async (req, res, next) => {
  try {
    const { category, quizId, file, questions, orgId, newsTimeline } = req.body;
    if (!questions || !orgId || !category) {
      next(new Error('Invalid request body'));
      return;
    }

    await addLambdaCallbackQuestions(
      questions,
      category,
      orgId,
      quizId,
      file,
      newsTimeline,
    );

    res.status(200).json({ message: 'Scheduled new questions' });
  } catch (error) {
    next(error);
  }
};

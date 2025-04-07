import {
  cancelLiveQuizService,
  cleanUpWeeklyQuizService,
  getScheduledQuizzesService,
  getWeeklyQuizStatusService,
  submitWeeklyQuizAnswersService,
  makeWeeklyQuizLiveService,
  getWeeklyQuizLiveQuestions,
} from '../services/quiz.service.js';

export const getQuizStatusController = async (req, res, next) => {
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

// test controller
export const makeWeeklyQuizLiveController = async (req, res, next) => {
  try {
    const result = await makeWeeklyQuizLiveService();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// test controller
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
    const { month, year } = req.query;
    const { orgId } = req.data;
    const quizzes = await getScheduledQuizzesService(orgId, month, year);
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

export const submitQuizAnswersController = async (req, res, next) => {
  try {
    const { answers, quizId } = req.body;
    const { employeeId, orgId } = req.data;
    if (!answers || !employeeId || !orgId || !quizId) {
      return res.status(400).json({ message: 'Required fields not present' });
    }

    const data = await submitWeeklyQuizAnswersService(
      answers,
      employeeId,
      orgId,
      quizId,
    );

    if (!data.success) {
      return res.status(400).json({
        message: data.message,
      });
    }

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
import {
  allowScheduledQuizSerivce,
  cancelLiveQuizService,
  cancelScheduledQuizSerivce,
  cleanUpQuizzesService,
  getScheduledQuizzesService,
  getWeeklyQuizLiveQuestionsService,
  getWeeklyQuizStatusService,
  makeQuizLiveService,
  submitWeeklyQuizAnswersService,
} from '../services/quiz.service.js';

/**
 * Gets the status of a weekly quiz for an employee
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.date - Date to check quiz status for
 * @param {Object} req.data - Request data containing orgId and employeeId
 * @param {string} req.data.orgId - Organization ID
 * @param {string} req.data.employeeId - Employee ID
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const getQuizStatusController = async (req, res, next) => {
  try {
    const { date } = req.query;
    const { orgId, employeeId } = req.data;
    if (!orgId || !employeeId)
      return res.status(404).json({ message: 'Missing organizationId' });

    const weeklyQuizStatus = await getWeeklyQuizStatusService(
      orgId,
      employeeId,
      date,
    );

    res.status(200).json(weeklyQuizStatus);
  } catch (error) {
    next(error);
  }
};

/**
 * Test controller for making a quiz live
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.date - Date to make quiz live for
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const makeQuizLiveController = async (req, res, next) => {
  try {
    const { date } = req.query;
    const result = await makeQuizLiveService(date);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Test controller for cleaning up expired quizzes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const cleanUpQuizzesController = async (req, res, next) => {
  try {
    const result = await cleanUpQuizzesService();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Allows a scheduled quiz to proceed
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.quizId - Quiz ID
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const allowScheduledQuizController = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const result = await allowScheduledQuizSerivce(quizId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Cancels a live quiz
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.quizId - Quiz ID
 * @param {Object} req.data - Request data containing orgId
 * @param {string} req.data.orgId - Organization ID
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const cancelLiveQuizController = async (req, res, next) => {
  try {
    const { orgId } = req.data;
    const { quizId } = req.params;
    const result = await cancelLiveQuizService(quizId, orgId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Cancels a scheduled quiz
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.quizId - Quiz ID
 * @param {Object} req.data - Request data containing orgId
 * @param {string} req.data.orgId - Organization ID
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const cancelScheduledQuizController = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const { orgId } = req.data;
    const result = await cancelScheduledQuizSerivce(quizId, orgId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Gets all scheduled quizzes for an organization
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {number} req.query.month - Month to get quizzes for (0-11)
 * @param {number} req.query.year - Year to get quizzes for
 * @param {Object} req.data - Request data containing orgId
 * @param {string} req.data.orgId - Organization ID
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const getScheduledQuizzesController = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const { orgId } = req.data;
    const quizzes = await getScheduledQuizzesService(
      orgId,
      parseInt(month),
      parseInt(year),
    );
    res.status(200).json(quizzes);
  } catch (error) {
    next(error);
  }
};

/**
 * Gets live questions for a weekly quiz
 * @param {Object} req - Express request object
 * @param {Object} req.data - Request data containing orgId
 * @param {string} req.data.orgId - Organization ID
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const getWeeklyQuizLiveQuestionsController = async (req, res, next) => {
  try {
    const { orgId } = req.data;
    if (!orgId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const weeklyQuizQuestions = await getWeeklyQuizLiveQuestionsService(orgId);

    res.status(200).json(weeklyQuizQuestions);
  } catch (error) {
    next(error);
  }
};

/**
 * Submits answers for a weekly quiz
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {Array} req.body.answers - Array of answers
 * @param {string} req.body.quizId - Quiz ID
 * @param {Object} req.data - Request data containing employeeId and orgId
 * @param {string} req.data.employeeId - Employee ID
 * @param {string} req.data.orgId - Organization ID
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
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

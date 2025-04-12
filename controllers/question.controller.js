import { validateEmployeeQuestionSubmission } from '../middleware/utils.js';
import {
  addNewHRPQuestionsCallbackService,
  approveEmployeeQuestionsService,
  createNewQuestionService,
  editQuizQuestionsService,
  generateCAnITQuestionsService,
  generateNewHRPQuestionsCallbackService,
  getEmployeesQuestionsToApproveService,
  getWeeklyQuizQuestions,
  rejectEmployeeQuestionsService,
  scheduleNextMonthQuizzesJob,
} from '../services/question.service.js';

/**
 * Edits questions for a specific quiz
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {Array} req.body.questions - Array of questions to edit
 * @param {Array} req.body.replaceQuestions - Array of [oldId, newId] pairs for replacement
 * @param {string} req.body.quizId - Quiz ID
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const editQuizQuestionsController = async (req, res, next) => {
  try {
    const { questions, replaceQuestions, quizId } = req.body;
    if (!quizId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    await editQuizQuestionsService(questions, replaceQuestions, quizId);

    res.status(200).json({ message: 'Questions marked as approved' });
  } catch (error) {
    next(error);
  }
};

/**
 * Creates a new question submitted by an employee
 * @param {Object} req - Express request object
 * @param {Object} req.body - Question data
 * @param {Object} req.data - Request data containing employeeId
 * @param {string} req.data.employeeId - Employee ID who created the question
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const createNewQuestionController = async (req, res, next) => {
  try {
    const question = req.body;
    const { employeeId } = req.data;
    const errors = validateEmployeeQuestionSubmission(question);
    if (errors) {
      return res.status(400).json(errors);
    }

    const isQuestionAdded = await createNewQuestionService(
      question,
      employeeId,
    );
    if (!isQuestionAdded) {
      return res.status(404).json({ message: 'Not able to save question' });
    }

    res.status(200).json({ message: 'Question added successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Gets questions for a scheduled quiz
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.quizId - Quiz ID
 * @param {Object} req.data - Request data containing orgId
 * @param {string} req.data.orgId - Organization ID
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const getScheduledQuizQuestionsController = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const { orgId } = req.data;
    if (!quizId) {
      return res.status(400).json({ message: 'Missing quizId' });
    }
    if (!orgId) {
      return res.status(400).json({ message: 'Missing orgId' });
    }

    const weeklyQuizQuestions = await getWeeklyQuizQuestions(orgId, quizId);
    res.status(200).json(weeklyQuizQuestions);
  } catch (error) {
    next(error);
  }
};

export const getEmployeeQuestionsToApproveController = async (req, res, next) => {
  try {
    const { orgId } = req.data;
    if (!orgId) {
      return res.status(400).json({ message: 'Missing orgId' });
    }

    const employeeQuestions = await getEmployeesQuestionsToApproveService(orgId);
    res.status(200).json(employeeQuestions);
  } catch (error) {
    next(error);
  }
};

export const rejectEmployeeQuestionsController = async (req, res, next) => {
  try {
    const { orgId } = req.data;
    const selectedQuestions = req.body;

    if (!orgId) {
      return res.status(400).json({ message: 'Missing orgId' });
    }

    const employeeQuestions = await rejectEmployeeQuestionsService(selectedQuestions);
    res.status(200).json(employeeQuestions);
  } catch (error) {
    next(error);
  }
};

export const approveEmployeeQuestionsController = async (req, res, next) => {
  try {
    const { orgId } = req.data;
    const selectedQuestions = req.body;

    if (!orgId) {
      return res.status(400).json({ message: 'Missing orgId' });
    }

    const employeeQuestions = await approveEmployeeQuestionsService(selectedQuestions);
    res.status(200).json(employeeQuestions);
  } catch (error) {
    next(error);
  }
};

/**
 * Callback controller for adding new HRP questions
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {Object} req.body.file - File object containing HRP data
 * @param {Array} req.body.questions - Array of new HRP questions
 * @param {string} req.body.orgId - Organization ID
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const addNewHRPQuestionsCallbackController = async (req, res, next) => {
  try {
    const { file, questions, orgId } = req.body;

    if (!questions || !orgId) {
      next(new Error('Invalid request body'));
      return;
    }

    await addNewHRPQuestionsCallbackService(questions, orgId, file);

    res.status(200).json({ message: 'Scheduled new questions' });
  } catch (error) {
    next(error);
  }
};

/**
 * Callback controller for generating new HRP questions
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.fileName - Name of the file containing HRP data
 * @param {Object} req.data - Request data containing orgId
 * @param {string} req.data.orgId - Organization ID
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const generateNewHRPQuestionsCallbackController = async (
  req,
  res,
  next,
) => {
  try {
    const { fileName } = req.body;
    const { orgId } = req.data;
    if (!fileName) {
      next(new Error('Invalid request body'));
      return;
    }

    await generateNewHRPQuestionsCallbackService(fileName, orgId);

    res.status(200).json({ message: 'Scheduled new questions' });
  } catch (error) {
    next(error);
  }
};

/**
 * Test controller for generating CAnIT questions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const generateCAnITQuestionsController = async (req, res, next) => {
  try {
    await generateCAnITQuestionsService();
    res.status(200).json({ message: 'CAnIT questions generated successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Test controller for scheduling quizzes for the next month
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const scheduleQuizzesJobController = async (req, res, next) => {
  try {
    const response = await scheduleNextMonthQuizzesJob();
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

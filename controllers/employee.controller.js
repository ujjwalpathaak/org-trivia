import {
  getEmployeeDetailsService,
  getEmployeePastResultsService,
  getSubmittedQuestionsService,
} from '../services/employee.service.js';

/**
 * Gets detailed information about an employee
 * @param {Object} req - Express request object
 * @param {Object} req.data - Request data containing employeeId
 * @param {string} req.data.employeeId - Employee ID
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const getEmployeeDetailsController = async (req, res, next) => {
  try {
    const { employeeId } = req.data;

    if (!employeeId) {
      return res.status(400).json({ message: 'Missing employeeId' });
    }

    const employeeDetails = await getEmployeeDetailsService(employeeId);

    res.status(200).json(employeeDetails);
  } catch (error) {
    next(error);
  }
};

/**
 * Gets past quiz results for an employee with pagination
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {number} [req.query.page=0] - Page number for pagination
 * @param {number} [req.query.size=10] - Number of results per page
 * @param {Object} req.data - Request data containing employeeId
 * @param {string} req.data.employeeId - Employee ID
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const getEmployeePastResultsController = async (req, res, next) => {
  try {
    const { page = 0, size = 10 } = req.query;
    const { employeeId } = req.data;

    if (!employeeId) {
      return res.status(400).json({ message: 'Missing employeeId' });
    }

    const pageNum = parseInt(page) || 0;
    const sizeNum = parseInt(size) || 10;

    const results = await getEmployeePastResultsService(
      employeeId,
      pageNum,
      sizeNum,
    );

    res.status(200).json(results);
  } catch (error) {
    next(error);
  }
};

/**
 * Gets questions submitted by an employee with pagination
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {number} [req.query.page=0] - Page number for pagination
 * @param {number} [req.query.size=10] - Number of results per page
 * @param {Object} req.data - Request data containing employeeId
 * @param {string} req.data.employeeId - Employee ID
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const getEmployeeSubmittedQuestionsController = async (
  req,
  res,
  next,
) => {
  try {
    const { employeeId } = req.data;
    const { page = 0, size = 10 } = req.query;

    if (!employeeId) {
      return res.status(400).json({ message: 'Missing employeeId' });
    }

    const pageNum = parseInt(page) || 0;
    const sizeNum = parseInt(size) || 10;

    const questions = await getSubmittedQuestionsService(
      employeeId,
      pageNum,
      sizeNum,
    );

    res.status(200).json(questions);
  } catch (error) {
    next(error);
  }
};

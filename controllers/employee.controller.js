import { validateEmployeeQuestionSubmission } from '../middleware/utils.js';
import {
  editEmployeeQuestionService,
  getEmployeeDetailsService,
  getEmployeePastResultsService,
  getSubmittedQuestionsService,
} from '../services/employee.service.js';

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

export const editEmployeeQuestionController = async (req, res, next) => {
  try {
    const question = req.body;
    const { employeeId } = req.data;

    if (!employeeId) {
      return res.status(400).json({ message: 'Missing employeeId' });
    }

    if (!question[0]._id) {
      return res.status(400).json({ message: 'Missing questionId' });
    }

    const errors = validateEmployeeQuestionSubmission(question[0]);
    if (errors) {
      return res.status(400).json(errors);
    }

    await editEmployeeQuestionService(employeeId, question[0]);

    res.status(200).json(question);
  } catch (error) {
    next(error);
  }
};

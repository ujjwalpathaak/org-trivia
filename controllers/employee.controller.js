import {
  fetchEmployeeDetails,
  getSubmittedQuestions,
} from '../services/employee.service.js';

export const getEmployeeDetailsController = async (req, res, next) => {
  try {
    const { employeeId } = req.data;
    if (!employeeId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const employeeDetails = await fetchEmployeeDetails(employeeId);
    res.status(200).json(employeeDetails);
  } catch (error) {
    next(error);
  }
};

export const getSubmittedQuestionsController = async (req, res, next) => {
  try {
    const { employeeId } = req.data;
    const { page = 0, size = 10 } = req.query;
    if (!employeeId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const questions = await getSubmittedQuestions(employeeId, page, size);
    res.status(200).json(questions);
  } catch (error) {
    next(error);
  }
};

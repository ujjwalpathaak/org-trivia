import employeeService from '../services/employee.service.js';

const getEmployeeDetails = async (req, res, next) => {
  try {
    const { employeeId } = req.data;
    if (!employeeId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const employeeDetails =
      await employeeService.fetchEmployeeDetails(employeeId);
    res.status(200).json(employeeDetails);
  } catch (error) {
    next(error);
  }
};

const getSubmittedQuestionsController = async (req, res, next) => {
  try {
    const { employeeId } = req.data;
    const { page = 0, size = 10 } = req.query;
    const submittedQuestions = await employeeService.fetchSubmittedQuestions(
      employeeId,
      page,
      size,
    );
    res.status(200).json(submittedQuestions);
  } catch (error) {
    next(error);
  }
};

export default {
  getEmployeeDetails,
  getSubmittedQuestionsController,
};

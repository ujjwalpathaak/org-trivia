import {
  getEmployeeDetails,
  getSubmittedQuestions,
} from '../repositories/employee.repository.js';

export const fetchEmployeeDetails = async (employeeId) => {
  return await getEmployeeDetails(employeeId);
};

export const getSubmittedQuestionsService = async (employeeId, page, size) => {
  return await getSubmittedQuestions(employeeId, page, size);
};

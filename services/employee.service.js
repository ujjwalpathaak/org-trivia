import employeeRepository from '../repositories/employee.repository.js';

const fetchEmployeeScore = async (employeeId) => {
  return await employeeRepository.getEmployeeScore(employeeId);
};

const fetchEmployeeDetails = async (employeeId) => {
  return await employeeRepository.getEmployeeDetails(employeeId);
};

const fetchPastQuizResults = async (employeeId) => {
  return await employeeRepository.getPastQuizResults(employeeId);
};

const fetchSubmittedQuestions = async (employeeId, page, size) => {
  return await employeeRepository.getSubmittedQuestions(employeeId, page, size);
};

export default {
  fetchEmployeeScore,
  fetchEmployeeDetails,
  fetchPastQuizResults,
  fetchSubmittedQuestions,
};

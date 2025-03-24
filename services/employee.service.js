import employeeRepository from '../repositories/employee.repository.js';

const fetchEmployeeDetails = async (employeeId) => {
  return await employeeRepository.getEmployeeDetails(employeeId);
};

const fetchSubmittedQuestions = async (employeeId, page, size) => {
  return await employeeRepository.getSubmittedQuestions(employeeId, page, size);
};

export default {
  fetchEmployeeDetails,
  fetchSubmittedQuestions,
};

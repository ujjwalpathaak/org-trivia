import {
  getEmployeeDetails,
  getSubmittedQuestions,
} from '../repositories/employee.repository.js';

import { getEmployeePastResults } from '../repositories/result.repository.js';

export const getEmployeeDetailsService = async (employeeId) => {
  return await getEmployeeDetails(employeeId);
};

export const getSubmittedQuestionsService = async (employeeId, page, size) => {
  return await getSubmittedQuestions(employeeId, page, size);
};

export const getEmployeePastResultsService = async (employeeId, page, size) => {
  return await getEmployeePastResults(employeeId, page, size);
};

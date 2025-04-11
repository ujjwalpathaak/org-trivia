import {
  getEmployeeDetails,
  getSubmittedQuestions,
} from '../repositories/employee.repository.js';
import { getEmployeePastResults } from '../repositories/result.repository.js';

/**
 * Retrieves detailed information about an employee
 * @param {string} employeeId - Unique identifier of the employee
 * @returns {Promise<Object>} Employee details including name, email, organization, etc.
 */
export const getEmployeeDetailsService = async (employeeId) => {
  return await getEmployeeDetails(employeeId);
};

/**
 * Retrieves questions submitted by an employee with pagination
 * @param {string} employeeId - Unique identifier of the employee
 * @param {number} page - Page number for pagination
 * @param {number} size - Number of items per page
 * @returns {Promise<Object>} Paginated list of questions submitted by the employee
 */
export const getSubmittedQuestionsService = async (employeeId, page, size) => {
  return await getSubmittedQuestions(employeeId, page, size);
};

/**
 * Retrieves past quiz results of an employee with pagination
 * @param {string} employeeId - Unique identifier of the employee
 * @param {number} page - Page number for pagination
 * @param {number} size - Number of items per page
 * @returns {Promise<Object>} Paginated list of employee's past quiz results
 */
export const getEmployeePastResultsService = async (employeeId, page, size) => {
  return await getEmployeePastResults(employeeId, page, size);
};

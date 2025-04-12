import {
  checkEmployeeHasSubmittedThisQuestion,
  getEmployeeDetails,
  getSubmittedQuestions,
} from '../repositories/employee.repository.js';
import { updateQuestion } from '../repositories/question.repository.js';
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

export const editEmployeeQuestionService = async (employeeId, question) => {
  if (!(await checkEmployeeHasSubmittedThisQuestion(employeeId, question._id)))
    return false;
  return await updateQuestion(question);
};

dotenv.config();
import dotenv from 'dotenv';

const API_GATEWAY_URL = process.env.API_GATEWAY_URL;

export const refactorPnAQuestionsToOrgContext = async (
  orgName,
  PnAQuestions,
  orgId,
) => {
  const response = await fetch(API_GATEWAY_URL + '/generatePnA_Questions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      orgName: orgName,
      PnAQuestions: PnAQuestions,
      orgId: orgId,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `HTTP error! Status: ${response.status}; Message: ${response.message}`,
    );
  }

  const refactoredPnAQuestions = await response.json();

  return refactoredPnAQuestions;
};

export const fetchNewCAnITQuestions = async (
  orgName,
  orgIndustry,
  orgId,
  quizId,
) => {
  const response = fetch(API_GATEWAY_URL + '/generateCAnIT_Questions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      orgName: orgName,
      orgIndustry: orgIndustry,
      orgId: orgId,
      quizId: quizId,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `HTTP error! Status: ${response.status}; Message: ${response.message}`,
    );
  }

  const finalCAnITQuestions = await response.json();

  return finalCAnITQuestions;
};

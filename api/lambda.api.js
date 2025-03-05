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

export const fetchNewCAnITQuestions = (
  orgName,
  orgIndustry,
  orgId,
  quizId
) => {
  fetch(API_GATEWAY_URL + "/generateCAnIT_Questions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      orgName,
      callbackUrl: "https://392b-183-82-55-162.ngrok-free.app",
      orgIndustry,
      orgId,
      quizId,
    }),
  }).catch((error) => console.error("Error triggering Lambda:", error));
};

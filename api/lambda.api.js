dotenv.config();
import dotenv from 'dotenv';

const API_GATEWAY_URL = process.env.API_GATEWAY_URL;

export const fetchNewCAnITQuestions = (
  orgName,
  orgIndustry,
  orgCountry,
  orgId,
  quizId,
) => {
  fetch(API_GATEWAY_URL + '/generateCAnIT_Questions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      orgName: orgName,
      callbackUrl: 'https://c253-2401-4900-1c23-105a-7156-d151-dc74-621c.ngrok-free.app',
      orgIndustry: orgIndustry,
      orgCountry: orgCountry,
      orgId: orgId,
      quizId: quizId,
    }),
  }).catch((error) => console.error('Error triggering Lambda:', error));
};

export const fetchNewPnAQuestions = (orgName, orgId, quizId) => {
  fetch(API_GATEWAY_URL + '/generatePnA_Questions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      orgName: orgName,
      callbackUrl: 'https://c253-2401-4900-1c23-105a-7156-d151-dc74-621c.ngrok-free.app',
      orgId: orgId,
      quizId: quizId,
    }),
  }).catch((error) => console.error('Error triggering Lambda:', error));
};

dotenv.config();
import dotenv from 'dotenv';

const API_GATEWAY_URL = process.env.API_GATEWAY_URL;

export const fetchNewCAnITQuestions = (
  orgName,
  orgIndustry,
  orgCountry,
  orgId,
  quizId,
  newsTimeline,
) => {
  fetch(API_GATEWAY_URL + '/generateCAnIT_Questions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      orgName: orgName,
      callbackUrl: 'https://4ebf-122-187-121-22.ngrok-free.app',
      orgIndustry: orgIndustry,
      orgCountry: orgCountry,
      orgId: orgId,
      quizId: quizId,
      newsTimeline: newsTimeline,
    }),
  }).catch((error) => console.error('Error triggering Lambda:', error));
};

export const fetchNewPnAQuestions = async (orgName) => {
  const response = await fetch(API_GATEWAY_URL + '/generatePnA_Questions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      orgName: orgName
    }),
  })

  const questions = await response.json();
  return questions;
};

export const rephraseQuestions = (questions_to_rephrase, orgId, quizId) => {
  fetch(API_GATEWAY_URL + '/paraphraseQuestions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      questions_to_rephrase: questions_to_rephrase,
      callbackUrl: 'https://b141-122-187-121-22.ngrok-free.app',
      orgId: orgId,
      quizId: quizId,
    }),
  }).catch((error) => console.error('Error triggering Lambda:', error));
};

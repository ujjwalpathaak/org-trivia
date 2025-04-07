dotenv.config();
import dotenv from 'dotenv';

const API_GATEWAY_URL = process.env.API_GATEWAY_URL;

export const fetchNewCAnITQuestions = async (
  orgName,
  orgIndustry,
  orgCountry,
  quizId,
  days,
) => {
  const response = await fetch(API_GATEWAY_URL + '/generateCAnIT_Questions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      orgName: orgName,
      orgIndustry: orgIndustry,
      orgCountry: orgCountry,
      quizId: quizId,
      days: days,
    }),
  });

  const questions = await response.json();
  return questions;
};

export const fetchNewPnAQuestions = async (orgName) => {
  const response = await fetch(API_GATEWAY_URL + '/generatePnA_Questions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      orgName: orgName,
    }),
  });

  const questions = await response.json();
  return questions;
};

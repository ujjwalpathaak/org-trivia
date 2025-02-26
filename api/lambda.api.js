const API_GATEWAY_URL =
  'https://w6d724kzj1.execute-api.eu-north-1.amazonaws.com';

export const fetchNewPnAQuestions = async (
  companyName,
  PnAQuestions,
  orgId,
) => {
  const response = await fetch(API_GATEWAY_URL + '/generatePnA_Questions', {
    method: 'POST',
    headers: {
      'x-api-key': 'your-api-key',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      companyName: companyName,
      PnAQuestions: PnAQuestions,
      orgId: orgId,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const finalPnAQuestions = await response.json();

  return finalPnAQuestions;
};
export const fetchNewCAnITQuestions = async (companyName, companyIndustry) => {
  const response = await fetch(API_GATEWAY_URL + '/generateCAnIT_Questions', {
    method: 'POST',
    headers: {
      'x-api-key': 'your-api-key',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      companyName: companyName,
      companyIndustry: companyIndustry,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const finalCAnITQuestions = await response.json();

  return finalCAnITQuestions;
};

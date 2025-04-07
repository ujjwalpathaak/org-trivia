import { fetchWithAuth } from './utils';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const getToken = () => localStorage.getItem('token');

const handleResponse = async (response, fallbackMessage = 'Something went wrong') => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || fallbackMessage);
  }
  return await response.json();
};

const fetchWithToken = async (url, options = {}, fallbackMessage) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return await handleResponse(response, fallbackMessage);
};

export const loginRequest = async (formData) => {
  return await fetch(`${BACKEND_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
};

export const registerRequest = async (formData) => {
  return await fetch(`${BACKEND_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
};

export const fetchSubmittedQuestionsAPI = async (pageNumber = 0, pageSize = 10) => {
  return await fetchWithToken(
    `${BACKEND_URL}/employee/questions/submitted?page=${pageNumber}&size=${pageSize}`,
    { method: 'GET' },
    'Failed to fetch submitted questions'
  );
};

export const fetchEmployeeQuizResultsAPI = async (pageNumber = 0, pageSize = 10) => {
  return await fetchWithToken(
    `${BACKEND_URL}/result/past?page=${pageNumber}&size=${pageSize}`,
    { method: 'GET' },
    'Failed to fetch quiz results'
  );
};

export const getOrgAnalyticsAPI = async () => {
  return await fetchWithAuth(`${BACKEND_URL}/org/analytics`, {
    method: 'GET',
  });
};

export const getEmployeeDetailsAPI = async () => {
  return await fetchWithAuth(`${BACKEND_URL}/employee`, {
    method: 'GET',
  });
};

export const fetchAllOrganizations = async () => {
  const response = await fetch(`${BACKEND_URL}/org`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return response;
};

export const createQuestionAPI = async (question) => {
  try {
    return await fetchWithToken(
      `${BACKEND_URL}/question`,
      {
        method: 'POST',
        body: JSON.stringify(question),
      },
      'Failed to create question'
    );
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const saveOrgSettings = async (newGenreOrder, changedGenres, companyCurrentAffairsTimeline) => {
  try {
    return await fetchWithToken(
      `${BACKEND_URL}/org/settings/save`,
      {
        method: 'POST',
        body: JSON.stringify({ newGenreOrder, changedGenres, companyCurrentAffairsTimeline }),
      },
      'Failed to save organization settings'
    );
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const fetchQuizDetailsAPI = async (quizId) => {
  try {
    const response = await fetch(`${BACKEND_URL}/question/scheduled/quiz/${quizId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return { status: response.status, data: await response.json() };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const fetchLiveQuizQuestionsAPI = async () => {
  try {
    return await fetchWithToken(
      `${BACKEND_URL}/quiz/live/questions`,
      { method: 'GET' },
      'Failed to fetch live quiz questions'
    );
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const fetchOrgSettingsAPI = async () => {
  try {
    return await fetchWithToken(
      `${BACKEND_URL}/org/settings`,
      { method: 'GET' },
      'Failed to fetch organization settings'
    );
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const toggleTriviaSettingAPI = async () => {
  try {
    return await fetchWithToken(
      `${BACKEND_URL}/org/settings/trivia/toggle`,
      { method: 'PATCH' },
      'Failed to toggle trivia setting'
    );
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const editWeeklyQuizAPI = async (questions, questionsToDelete) => {
  try {
    return await fetchWithToken(
      `${BACKEND_URL}/quiz/questions`,
      {
        method: 'POST',
        body: JSON.stringify({ questions, questionsToDelete }),
      },
      'Failed to edit weekly quiz'
    );
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const submitQuizAnswersAPI = async (answers, quizId) => {
  try {
    return await fetchWithToken(
      `${BACKEND_URL}/quiz/submit`,
      {
        method: 'POST',
        body: JSON.stringify({ answers, quizId }),
      },
      'Failed to submit quiz answers'
    );
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const fetchLeaderboardAPI = async (month, year) => {
  try {
    return await fetchWithToken(
      `${BACKEND_URL}/leaderboard?month=${month}&year=${year}`,
      { method: 'GET' },
      'Failed to fetch leaderboard'
    );
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const cancelLiveQuizAPI = async (quizId) => {
  try {
    return await fetchWithToken(
      `${BACKEND_URL}/quiz/${quizId}/cancel`,
      { method: 'PATCH' },
      'Failed to cancel live quiz'
    );
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const fetchScheduledQuizzesAPI = async (month, year) => {
  try {
    return await fetchWithToken(
      `${BACKEND_URL}/quiz/scheduled?month=${month}&year=${year}`,
      { method: 'GET' },
      'Failed to fetch scheduled quizzes'
    );
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getWeeklyQuizStatusAPI = async () => {
  try {
    return await fetchWithToken(
      `${BACKEND_URL}/quiz/status`,
      { method: 'GET' },
      'Failed to fetch weekly quiz status'
    );
  } catch (error) {
    return { success: false, error: error.message };
  }
};

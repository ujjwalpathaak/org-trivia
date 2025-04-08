import { fetchWithAuth } from './utils';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const token = localStorage.getItem('token');

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

export const loginRequest = async (formData) => {
  const response = await fetch(`${BACKEND_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  return response;
};

export const registerRequest = async (formData) => {
  const response = await fetch(`${BACKEND_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  return response;
};

// to merge: employee/dashboard
export const fetchSubmittedQuestionsAPI = async (pageNumber = 0, pageSize = 10) => {
  const response = await fetch(
    `${BACKEND_URL}/employee/questions/submitted?page=${pageNumber}&size=${pageSize}`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) throw new Error('Network response was not ok');
  return await response.json();
};

// to merge: employee/dashboard
export const fetchEmployeeQuizResultsAPI = async (pageNumber = 0, pageSize = 10) => {
  const response = await fetch(
    `${BACKEND_URL}/employee/results/past?page=${pageNumber}&size=${pageSize}`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) throw new Error('Network response was not ok');
  return await response.json();
};

// to merge: admin/dashboard
export const getOrgAnalyticsAPI = async () => {
  return await fetchWithAuth(`${BACKEND_URL}/org/analytics`, {
    method: 'GET',
  });
};

// to merge: employee/dashboard
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
    const response = await fetch(`${BACKEND_URL}/question`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(question),
    });

    if (!response.ok)
      throw new Error((await response.json()).message || 'Failed to create question');
    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const saveOrgSettings = async (
  newGenreOrder,
  changedGenres,
  companyCurrentAffairsTimeline
) => {
  try {
    const response = await fetch(`${BACKEND_URL}/org/settings/save`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ newGenreOrder, changedGenres, companyCurrentAffairsTimeline }),
    });

    if (!response.ok)
      throw new Error((await response.json()).message || 'Failed to save genre settings');
    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const fetchScheduledQuizQuestionsAPI = async (quizId) => {
  try {
    const response = await fetch(`${BACKEND_URL}/question/scheduled/quiz/${quizId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    return { status: response.status, data: await response.json() };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const fetchLiveQuizQuestionsAPI = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/quiz/live/questions`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok)
      throw new Error((await response.json()).message || 'Failed to fetch live questions');
    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const fetchOrgSettingsAPI = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/org/settings`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok)
      throw new Error((await response.json()).message || 'Failed to fetch org settings');
    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const toggleTriviaSettingAPI = async (isEnabled) => {
  try {
    const response = await fetch(`${BACKEND_URL}/org/settings/trivia/toggle`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ isEnabled }),
    });

    if (!response.ok) throw new Error((await response.json()).message || 'Failed to toggle trivia');
    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const editWeeklyQuizAPI = async (questions, questionsToDelete) => {
  try {
    const response = await fetch(`${BACKEND_URL}/question/quiz`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ questions, questionsToDelete }),
    });

    if (!response.ok) throw new Error((await response.json()).message || 'Failed to edit quiz');
    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const submitQuizAnswersAPI = async (answers, quizId) => {
  try {
    const response = await fetch(`${BACKEND_URL}/quiz/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ answers, quizId }),
    });

    if (!response.ok)
      throw new Error((await response.json()).message || 'Failed to submit answers');
    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// to merge: admin/dashboard & employee/dashboard
export const fetchLeaderboardAPI = async (month, year) => {
  try {
    const response = await fetch(`${BACKEND_URL}/org/leaderboard?month=${month}&year=${year}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok)
      throw new Error((await response.json()).message || 'Failed to fetch leaderboard');
    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const cancelLiveQuizAPI = async (quizId) => {
  try {
    const response = await fetch(`${BACKEND_URL}/quiz/${quizId}/cancel`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });

    if (!response.ok) throw new Error((await response.json()).message || 'Failed to cancel quiz');
    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const fetchPresignedUrl = async (file) => {
  try {
      const presignedRes = await fetch(`${BACKEND_URL}/upload/get-presigned-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
        }),
      });

      return await presignedRes.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const startHRPQuestionGeneration = async (fileName) => {
  try {
    await fetch(`${BACKEND_URL}/question/generate/HRP`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ fileName: fileName }),
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const uploadFileToS3 = async (uploadUrl, file) => {
  try {
    const res = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!res.ok) throw new Error('Failed to upload file to S3');

  } catch (error) {
    return { success: false, error: error.message };
  }
};

// to merge: admin/dashboard
export const fetchScheduledQuizzesAPI = async (month, year) => {
  try {
    const response = await fetch(`${BACKEND_URL}/quiz/scheduled?month=${month}&year=${year}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok)
      throw new Error((await response.json()).message || 'Failed to fetch scheduled quizzes');
    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// to merge: employee/dashboard
export const getWeeklyQuizStatusAPI = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/quiz/status`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) throw new Error((await response.json()).message || 'Failed to get status');
    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

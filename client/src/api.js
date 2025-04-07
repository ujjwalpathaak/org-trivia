import { fetchWithAuth } from './utils';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const token = localStorage.getItem('token');

export const loginRequest = async (formData) => {
  const response = await fetch(BACKEND_URL + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });

  return response;
};

export const registerRequest = async (formData) => {
  const response = await fetch(BACKEND_URL + '/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });

  return response;
};

export const getPastSubmittedQuestionsAPI = async (pageNumber = 0, pageSize = 10) => {
  const response = await fetch(
    `${BACKEND_URL}/employee/submitted-questions?page=${pageNumber}&size=${pageSize}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return await response.json();
};

export const getPastQuizResultsAPI = async (pageNumber = 0, pageSize = 10) => {
  const response = await fetch(
    `${BACKEND_URL}/result/employee?page=${pageNumber}&size=${pageSize}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return await response.json();
};

export const getAnalyticsAPI = async () => {
  return await fetchWithAuth(`${BACKEND_URL}/org/analytics`, {
    method: 'GET',
  });
};

export const getEmployeeDetailsAPI = async () => {
  return await fetchWithAuth(`${BACKEND_URL}/employee`, {
    method: 'GET',
  });
};

export const getAllOrgsAPI = async () => {
  const response = await fetch(BACKEND_URL + '/org', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  return response;
};

export const createNewQuestionAPI = async (formData) => {
  try {
    const response = await fetch(`${BACKEND_URL}/question`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ question: formData }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create question');
    }

    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const saveSettingsAPI = async (
  newGenreOrder,
  changedGenres,
  companyCurrentAffairsTimeline
) => {
  try {
    const response = await fetch(`${BACKEND_URL}/org/save/settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ newGenreOrder, changedGenres, companyCurrentAffairsTimeline }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to save genre settings');
    }

    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getQuestionsToApproveAPI = async (quizId) => {
  try {
    const response = await fetch(`${BACKEND_URL}/question/weekly-quiz/${quizId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    return { status: response.status, data: await response.json() };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getWeeklyQuizQuestionsAPI = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/quiz/questions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create question');
    }

    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getSettingsAPI = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/org/settings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create question');
    }

    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const toggleTriviaAPI = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/org/settings/toggleTrivia`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create question');
    }

    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const handleEditWeeklyQuizAPI = async (questions, questionsToDelete) => {
  try {
    const response = await fetch(`${BACKEND_URL}/quiz/questions/edit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ questions, questionsToDelete }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create question');
    }

    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const submitWeeklyQuizAnswersAPI = async (weeklyQuizAnswers, quizId) => {
  try {
    const data = {
      answers: weeklyQuizAnswers,
      quizId: quizId,
    };
    const response = await fetch(`${BACKEND_URL}/result/submitWeeklyQuizAnswers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create question');
    }

    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getLeaderboardAPI = async (month, year) => {
  try {
    const response = await fetch(`${BACKEND_URL}/leaderboard?month=${month}&year=${year}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create question');
    }

    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const cancelQuizAPI = async (quizId) => {
  try {
    const response = await fetch(`${BACKEND_URL}/quiz/live/cancel?quizId=${quizId} `, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create question');
    }

    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getMonthQuizzesAPI = async (month, year) => {
  try {
    const response = await fetch(`${BACKEND_URL}/quiz/scheduled`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create question');
    }

    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getWeeklyQuizStatusAPI = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/quiz/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create question');
    }

    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

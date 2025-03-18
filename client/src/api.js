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

export const getPastQuizResults = async (employeeId, pageNumber = 0, pageSize = 10) => {
  const response = await fetch(
    `${BACKEND_URL}/result/employee/${employeeId}?page=${pageNumber}&size=${pageSize}`,
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

export const getAnalytics = async (orgId) => {
  const response = await fetch(`${BACKEND_URL}/org/analytics/${orgId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  return await response.json();
};

export const getEmployeeDetails = async (employeeId) => {
  const response = await fetch(BACKEND_URL + `/employee/${employeeId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  return await response.json();
};

export const getAllOrgs = async () => {
  const response = await fetch(BACKEND_URL + '/org', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  return response;
};

export const createNewQuestion = async (formData, employeeId) => {
  try {
    const response = await fetch(`${BACKEND_URL}/question`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ question: formData, employeeId: employeeId }),
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

export const saveGenreSettings = async (newGenres, orgId) => {
  try {
    const response = await fetch(`${BACKEND_URL}/org/settings/genre/${orgId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newGenres),
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

export const getQuestionsToApprove = async (orgId) => {
  try {
    const response = await fetch(
      `${BACKEND_URL}/question/weekly/unapproved/${orgId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return { status: response.status, data: await response.json() };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getWeeklyQuizQuestions = async (orgId) => {
  try {
    const response = await fetch(`${BACKEND_URL}/quiz/questions/${orgId}`, {
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

export const getSettings = async (orgId) => {
  try {
    const response = await fetch(`${BACKEND_URL}/org/settings/${orgId}`, {
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

export const toggleTrivia = async (orgId) => {
  try {
    const response = await fetch(
      `${BACKEND_URL}/org/settings/toggleTrivia/${orgId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create question');
    }

    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const handleApproveWeeklyQuiz = async (questions, orgId) => {
  try {
    const response = await fetch(`${BACKEND_URL}/quiz/approve/${orgId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(questions),
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

export const submitWeeklyQuizAnswers = async (
  weeklyQuizAnswers,
  orgId,
  employeeId,
  quizId
) => {
  try {
    const data = {
      answers: weeklyQuizAnswers,
      orgId: orgId,
      employeeId: employeeId,
      quizId: quizId,
    };
    const response = await fetch(
      `${BACKEND_URL}/result/submitWeeklyQuizAnswers`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create question');
    }

    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getLeaderboardByOrgId = async (orgId) => {
  try {
    const response = await fetch(`${BACKEND_URL}/leaderboard/${orgId}`, {
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

export const isWeeklyQuizLive = async (orgId, employeeId) => {
  try {
    const response = await fetch(
      `${BACKEND_URL}/quiz/status/${orgId}/${employeeId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create question');
    }

    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const fetchEmployeeScore = async (employeeId) => {
  try {
    const response = await fetch(
      `${BACKEND_URL}/employee/score/${employeeId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create question');
    }

    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

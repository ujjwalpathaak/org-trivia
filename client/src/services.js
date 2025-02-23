const BACKEND_URL = import.meta.env.VITE_BACKEND_URL
const token = localStorage.getItem("token");

export const loginRequest = async (formData) => {
    const response = await fetch(BACKEND_URL + "/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

    return response;
}

export const registerRequest = async (formData) => {
    const response = await fetch(BACKEND_URL + "/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

    return response;
}

export const getAllOrgs = async () => {
    const response = await fetch(BACKEND_URL + "/org", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });

    return response;
}

export const getEmployeesByOrg = async (orgId) => {
    const response = await fetch(BACKEND_URL + `/employee/org/${orgId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` }
      });

    return response;
}

export const createNewQuestion = async (formData, token) => {
  try {
    const response = await fetch(`${BACKEND_URL}/question`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create question");
    }

    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

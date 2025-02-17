const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

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
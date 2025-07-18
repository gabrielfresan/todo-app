import axios from "axios";

const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api/auth",
});

export const register = async (userData) => {
  const response = await authApi.post("/register", userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await authApi.post("/login", credentials);
  return response.data;
};

export const getCurrentUser = async (token) => {
  const response = await authApi.get("/me", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const verifyEmail = async (email, code) => {
  const response = await authApi.post("/verify-email", { email, code });
  return response.data;
};

export const resendVerification = async (email) => {
  const response = await authApi.post("/resend-verification", { email });
  return response.data;
};
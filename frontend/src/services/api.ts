import axios from "axios";
import Cookies from "js-cookie";

// Configuración base de Axios
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Importante para CORS con autenticación
});

// Interceptor para incluir token en las requests
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    if (error.response?.status === 401) {
      Cookies.remove("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
  login: (credentials: { username: string; password: string }) =>
    api.post("/api/auth/login", credentials),
  register: (userData: {
    username: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    university?: string;
    major?: string;
  }) => api.post("/api/auth/register", userData),
  verifyToken: () => api.post("/api/auth/verify-token"),
  getProfile: () => api.get("/api/auth/profile"),
};

// Servicios de preguntas
export const questionService = {
  getQuestions: (params?: any) => api.get("/api/questions", { params }),
  getQuestion: (id: number) => api.get(`/api/questions/${id}`),
  createQuestion: (questionData: any) =>
    api.post("/api/questions", questionData),
  updateQuestion: (id: number, questionData: any) =>
    api.put(`/api/questions/${id}`, questionData),
  deleteQuestion: (id: number) => api.delete(`/api/questions/${id}`),
};

// Servicios de respuestas
export const answerService = {
  createAnswer: (answerData: any) => api.post("/api/answers", answerData),
  updateAnswer: (id: number, answerData: any) =>
    api.put(`/api/answers/${id}`, answerData),
  deleteAnswer: (id: number) => api.delete(`/api/answers/${id}`),
  acceptAnswer: (id: number) => api.post(`/api/answers/${id}/accept`),
};

// Servicios de usuarios
export const userService = {
  getUser: (id: number) => api.get(`/api/users/${id}`),
  updateProfile: (userData: any) => api.put("/api/users/profile", userData),
  getUserQuestions: (id: number, params?: any) =>
    api.get(`/api/users/${id}/questions`, { params }),
  getUserAnswers: (id: number, params?: any) =>
    api.get(`/api/users/${id}/answers`, { params }),
};

export default api;

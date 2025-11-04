import axios from "axios";
import { env } from "./env";

export const api = axios.create({
  baseURL: `${env.API_URL}/api`,
  timeout: 15000,
  withCredentials: true, // Send cookies with requests
});

// Request interceptor: Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle errors and token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized (token expired or invalid)
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;

      // Only redirect if we're not already on the login page
      if (!currentPath.includes("/admin/login")) {
        // Clear auth data
        localStorage.removeItem("authToken");
        localStorage.removeItem("admin");

        // Redirect to login
        window.location.href = "/admin/login";
      }
    }

    // Handle 429 Too Many Requests (rate limiting)
    if (error.response?.status === 429) {
      const errorMessage =
        error.response?.data?.error ||
        "Too many requests. Please try again later.";
      return Promise.reject(new Error(errorMessage));
    }

    // Return structured error
    const errorMessage =
      error?.response?.data?.error || error?.message || "Unknown error";
    return Promise.reject(new Error(errorMessage));
  }
);

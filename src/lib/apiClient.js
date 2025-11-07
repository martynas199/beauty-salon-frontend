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

// Response interceptor: Enhanced error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (!error.response) {
      const networkError = new Error(
        error.code === "ECONNABORTED"
          ? "Request timed out. Please check your connection and try again."
          : "Network error. Please check your internet connection."
      );
      networkError.isNetworkError = true;
      networkError.originalError = error;
      return Promise.reject(networkError);
    }

    // Handle 401 Unauthorized
    if (error.response.status === 401) {
      const currentPath = window.location.pathname;

      if (!currentPath.includes("/admin/login")) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("admin");
        window.location.href = "/admin/login";
      }
    }

    // Handle 429 Too Many Requests
    if (error.response.status === 429) {
      const retryAfter = error.response.headers["retry-after"];
      const errorMessage = retryAfter
        ? `Too many requests. Please wait ${retryAfter} seconds.`
        : "Too many requests. Please try again later.";

      const rateLimitError = new Error(errorMessage);
      rateLimitError.isRateLimitError = true;
      rateLimitError.retryAfter = retryAfter;
      return Promise.reject(rateLimitError);
    }

    // Handle 503 Service Unavailable
    if (error.response.status === 503) {
      const maintenanceError = new Error(
        "Service temporarily unavailable. We're working on it!"
      );
      maintenanceError.isMaintenanceError = true;
      return Promise.reject(maintenanceError);
    }

    // Return structured error
    const errorMessage =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.message ||
      "An unexpected error occurred";

    const structuredError = new Error(errorMessage);
    structuredError.status = error.response?.status;
    structuredError.response = error.response;

    return Promise.reject(structuredError);
  }
);

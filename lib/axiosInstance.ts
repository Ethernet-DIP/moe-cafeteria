import axios from "axios";
import { restoreAuth } from "./auth-service";

// Create axios instance for the MOE Cafeteria Backend API
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
});

// Initialize authentication from stored credentials
export const initializeAuth = () => {
  restoreAuth();
};

// Initialize auth on module load
if (typeof window !== 'undefined') {
  initializeAuth();
}

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 401:
          console.error("Authentication failed");
          // Clear authentication on 401
          delete apiClient.defaults.headers.common['Authorization'];
          localStorage.removeItem("currentUser");
          break;
        case 403:
          console.error("Access forbidden");
          break;
        case 404:
          console.error("Resource not found");
          break;
        case 500:
          console.error("Server error");
          break;
        default:
          console.error(`API Error: ${error.response.status}`, error.response.data);
      }
    } else if (error.request) {
      // Network error
      console.error("Network error - unable to reach server");
    } else {
      // Other error
      console.error("Request error:", error.message);
    }
    
    return Promise.reject(error);
  }
);

// Legacy remote axios instance (keeping for backward compatibility)
export const remoteAxiosInstance = apiClient;
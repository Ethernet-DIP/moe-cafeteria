import axios from "axios";

export const remoteAxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
  },
});


// Remote axiosInstance ResponseIntercept
remoteAxiosInstance.interceptors.response.use(
  (response) => {
    // Can be modified response
    return response;
  },
  (error) => {  
    // Handle response errors here
    return Promise.reject(error);
  }
);
// src/api/axiosConfig.ts
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/`,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    // Remove Content-Type for FormData
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    // ✅ Read token from AdminData (not userData)
    let token: string | null = null;
    try {
      const adminDataStr = localStorage.getItem("AdminData");
      if (adminDataStr) {
        const adminData: { token?: string } = JSON.parse(adminDataStr);
        token = adminData?.token ?? null;
      }
    } catch (e) {
      console.error("Token parsing error:", e);
    }

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    } else {
      console.warn("No token found!");
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Unauthorized! Token expired or invalid.");
      // ✅ Remove AdminData (not userData)
      localStorage.removeItem("AdminData");
      // ✅ Redirect to admin login (not /login)
      window.location.href = "/admin/login";
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;

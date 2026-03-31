import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const REFRESH_URL = `${API_BASE_URL}/api/v1/user/refresh-token`;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

const clearAuth = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  window.dispatchEvent(new Event("auth:logout"));
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers = config.headers || {};
      if (!config.headers.Authorization && !config.headers.authorization) {
        config.headers.Authorization = token;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;
    const code = error?.response?.data?.code;

    const isAuthFailure = status === 401;
    const isRefreshCall = originalRequest?.url?.includes("/refresh-token");

    if (isAuthFailure && !isRefreshCall && !originalRequest?._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        clearAuth();
        return Promise.reject(error);
      }

      try {
        const refreshRes = await axios.post(
          REFRESH_URL,
          { refreshToken },
          {
            headers: {
              "Content-Type": "application/json",
              "x-refresh-token": refreshToken,
            },
          },
        );

        if (refreshRes.data?.success && refreshRes.data?.accessToken) {
          const newAccessToken = refreshRes.data.accessToken;
          localStorage.setItem("accessToken", newAccessToken);
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = newAccessToken;
          return api(originalRequest);
        }
      } catch (refreshError) {
        clearAuth();
        return Promise.reject(refreshError);
      }
    }

    if (isAuthFailure && ["TOKEN_INVALID", "TOKEN_EXPIRED"].includes(code)) {
      clearAuth();
    }

    return Promise.reject(error);
  },
);

export default api;

export const getApiErrorMessage = (error, fallback = "Something went wrong") => {
  return (
    error?.response?.data?.message ||
    (error?.code === "ECONNABORTED" ? "Request timed out. Please try again." : "") ||
    error?.message ||
    fallback
  );
};


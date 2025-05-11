import axios from "axios";
import { API_URL } from "@/constants/api";
import * as SecureStore from "expo-secure-store";
import { AxiosError } from "axios";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const accessToken = await SecureStore.getItemAsync("access_token");

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  console.log(`Request: ${config.url}`);

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    console.log(JSON.stringify(error.response));

    if (
      error instanceof AxiosError &&
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync("refresh_token");
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        await SecureStore.setItemAsync(
          "access_token",
          response.data.accessToken
        );
        await SecureStore.setItemAsync(
          "refresh_token",
          response.data.refreshToken
        );

        originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        await SecureStore.deleteItemAsync("access_token");
        await SecureStore.deleteItemAsync("refresh_token");
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

/* eslint-disable no-param-reassign */
import axios from "axios";
import { getAuthToken } from "@/utils/authStorage";

const baseURL = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, "") ?? "";

const axiosInstance = axios.create({
  baseURL,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export { axiosInstance };

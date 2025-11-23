import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:5000/api", // Replace with your Flask backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

export const getUserData = async () => {
  const response = await api.get("/user");
  return response.data;
};

// attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
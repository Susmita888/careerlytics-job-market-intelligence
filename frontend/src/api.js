
import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
  timeout: 30000,
});

// Attach authentication token to requests.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Extract readable error messages.
export const errMsg = (error) => {
  const detail = error?.response?.data?.detail;

  if (Array.isArray(detail)) {
    return detail
      .map((item) => item.msg || String(item))
      .join("; ");
  }

  if (typeof detail === "string") {
    return detail;
  }

  if (detail && typeof detail === "object") {
    return detail.message || "Something went wrong";
  }

  if (error?.code === "ECONNABORTED") {
    return "Request timed out. Please try again.";
  }

  if (!error?.response) {
    return "Unable to connect to the server. Please check your connection.";
  }

  return error?.message || "Something went wrong";
};

// Format Indian currency.
export const inr = (value) => {
  if (value == null || Number.isNaN(Number(value))) {
    return null;
  }

  const amount = Number(value);

  return amount >= 100000
    ? `₹${(amount / 100000).toFixed(1)} L`
    : `₹${Math.round(amount).toLocaleString("en-IN")}`;
};

// Format annual salary.
export const salary = (job) => {
  if (job.salary_min == null && job.salary_max == null) {
    return "Salary not listed";
  }

  const min = inr(job.salary_min);
  const max = inr(job.salary_max);

  if (min && max) {
    return `${min}–${max} / yr`;
  }

  return `${min || max} / yr`;
};

export default api;

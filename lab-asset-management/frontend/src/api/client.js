import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE || "/api";

const api = axios.create({ baseURL });

// Attach the JWT to every request if present.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401, clear the session and bounce to login.
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem("token");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

// Download a report (xlsx/pdf/csv) as an authenticated blob.
export async function downloadReport(scope, format) {
  const res = await api.get(`/reports/${scope}?format=${format}`, {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${scope}.${format === "excel" ? "xlsx" : format}`;
  a.click();
  window.URL.revokeObjectURL(url);
}

export default api;

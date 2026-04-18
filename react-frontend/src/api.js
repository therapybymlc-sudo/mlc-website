import axios from "axios";
// ==============================
// Axios Setup
// ==============================
// Use a baseURL WITHOUT trailing slash and pass paths WITHOUT leading slash
const API_BASE = (
  (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_BASE : null) ||
  (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_API_BASE : null) || 
  "http://127.0.0.1:8000/api"
).replace(/\/+$/, "");

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

let tokenGetter = null;
export const setTokenGetter = (getter) => {
  tokenGetter = getter;
};

// Attach token automatically
api.interceptors.request.use(async (config) => {
  if (tokenGetter) {
    try {
      const token = await tokenGetter();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        // Keep localStorage in sync for other non-getter requests
        if (typeof window !== "undefined") {
          localStorage.setItem("access_token", token);
        }
      }
      return config;
    } catch (e) {
      console.warn("API Token Getter failed", e);
    }
  }
  
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle expired tokens globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isTokenExpired = error.response?.status === 401 || 
                          (error.response?.status === 403 && error.response?.data?.detail === "Token expired");

    if (isTokenExpired && !originalRequest._retry) {
      console.warn("Token expired detected. Clearing stale session.");
      
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
      }
      delete api.defaults.headers.Authorization;
      
      // If it's a GET request, we can safely retry without a token (it might be public content)
      if (originalRequest.method === 'get') {
        originalRequest._retry = true;
        delete originalRequest.headers.Authorization;
        return api(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);

// ==============================
// Generic helpers (ensuring paths have trailing slash for Django)
// ==============================
function preparePath(path) {
  let cleanPath = path.replace(/^\/+/, "");
  if (cleanPath && !cleanPath.endsWith("/")) {
    cleanPath += "/";
  }
  return cleanPath;
}

export async function apiGet(path) {
  try {
    const res = await api.get(preparePath(path));
    return res.data;
  } catch (err) {
    console.error(`API GET Error [${path}]:`, err.response?.status, err.response?.data || err.message);
    throw err;
  }
}

export async function apiPost(path, body) {
  try {
    const res = await api.post(preparePath(path), body);
    return res.data;
  } catch (err) {
    console.error(`API POST Error [${path}]:`, err.response?.status, err.response?.data || err.message);
    throw err;
  }
}

export async function apiPut(path, body) {
  try {
    const res = await api.put(preparePath(path), body);
    return res.data;
  } catch (err) {
    console.error(`API PUT Error [${path}]:`, err.response?.status, err.response?.data || err.message);
    throw err;
  }
}

export async function apiPatch(path, body) {
  try {
    const res = await api.patch(preparePath(path), body);
    return res.data;
  } catch (err) {
    console.error(`API PATCH Error [${path}]:`, err.response?.status, err.response?.data || err.message);
    throw err;
  }
}

export async function apiDelete(path) {
  try {
    const res = await api.delete(preparePath(path));
    return res.status === 204 || res.status === 200;
  } catch (err) {
    console.error(`API DELETE Error [${path}]:`, err.response?.status, err.response?.data || err.message);
    throw err;
  }
}

export async function apiUpload(path, formData) {
  let token = null;
  if (tokenGetter) {
    token = await tokenGetter();
  } else if (typeof window !== "undefined") {
    token = localStorage.getItem("access_token");
  }
  const url = `${API_BASE}/${path.replace(/^\/+/, "")}`;
  const res = await fetch(url, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ==============================
// Note Template CRUD Helpers
// ==============================
export async function getNoteTemplates() {
  return apiGet("note-templates/");
}

export async function createNoteTemplate(payload) {
  return apiPost("note-templates/", payload);
}

export async function updateNoteTemplate(id, payload) {
  return apiPut(`note-templates/${id}/`, payload);
}

export async function deleteNoteTemplate(id) {
  return apiDelete(`note-templates/${id}/`);
}

export default api;

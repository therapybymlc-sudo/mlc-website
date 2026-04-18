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
    const token = await tokenGetter();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  }
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

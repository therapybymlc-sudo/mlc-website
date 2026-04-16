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
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ==============================
// Generic helpers (paths WITHOUT leading slash)
// ==============================
export async function apiGet(path) {
  const res = await api.get(path.replace(/^\/+/, ""));
  return res.data;
}

export async function apiPost(path, body) {
  const res = await api.post(path.replace(/^\/+/, ""), body);
  return res.data;
}

export async function apiPut(path, body) {
  const res = await api.put(path.replace(/^\/+/, ""), body);
  return res.data;
}

export async function apiPatch(path, body) {
  const res = await api.patch(path.replace(/^\/+/, ""), body);
  return res.data;
}

export async function apiDelete(path) {
  const res = await api.delete(path.replace(/^\/+/, ""));
  return res.status === 204 || res.status === 200;
}

export async function apiUpload(path, formData) {
  const token = tokenGetter ? await tokenGetter() : localStorage.getItem("access_token");
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

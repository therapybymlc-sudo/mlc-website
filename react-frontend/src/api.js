import axios from "axios";
// ==============================
// Axios Setup
// ==============================
// Use a baseURL WITHOUT trailing slash and pass paths WITHOUT leading slash
const API_BASE = (
  (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_BASE : null) ||
  (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_API_BASE : null) || 
  "http://localhost:8000/api"
).replace(/\/+$/, "");

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

let tokenGetter = null;
export const setTokenGetter = (getter) => {
  tokenGetter = getter;
};

const CLERK_JWT_TEMPLATE =
  (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_CLERK_JWT_TEMPLATE : null) ||
  (typeof import.meta !== "undefined" && import.meta.env ? import.meta.env.VITE_CLERK_JWT_TEMPLATE : null) ||
  null;

const isLikelyJwt = (token) =>
  typeof token === "string" && token.split(".").length === 3;

async function resolveClerkTokenFallback() {
  if (typeof window === "undefined" || !window.Clerk?.session?.getToken) return null;
  try {
    // Prefer default Clerk session token for backend JWKS verification.
    const sessionToken = await window.Clerk.session.getToken();
    if (isLikelyJwt(sessionToken)) return sessionToken;
    if (CLERK_JWT_TEMPLATE) {
      const templated = await window.Clerk.session.getToken({ template: CLERK_JWT_TEMPLATE });
      if (isLikelyJwt(templated)) return templated;
    }
    return null;
  } catch (e) {
    console.warn("Clerk fallback token retrieval failed", e);
    return null;
  }
}

// Attach token automatically
api.interceptors.request.use(async (config) => {
  let resolvedToken = null;

  // 🔄 Priority 1: Use the tokenGetter (linked to useAuth().getToken() in AuthContext)
  if (tokenGetter) {
    try {
      resolvedToken = await tokenGetter();
    } catch (e) {
      console.warn("API Token Getter failed", e);
    }
  }

  // 🔄 Priority 2: Fallback to window.Clerk directly if getter failed
  if (!resolvedToken) {
    resolvedToken = await resolveClerkTokenFallback();
  }

  if (resolvedToken) {
    config.headers.Authorization = `Bearer ${resolvedToken}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle expired tokens globally and implement a single retry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const detail = String(error.response?.data?.detail || "");
    const isAuthError =
      error.response?.status === 401 ||
      (error.response?.status === 403 &&
        (detail === "Token expired" || detail.includes("Invalid Clerk token")));

    // 🚀 Retry logic: If it's an auth error and we haven't retried yet
    if (isAuthError && !originalRequest._retry) {
      originalRequest._retry = true;
      console.warn("Auth token rejected. Attempting refresh and retry...");
      
      try {
        // Force a fresh token retrieval
        let freshToken = null;
        if (tokenGetter) {
          freshToken = await tokenGetter();
        } else {
          freshToken = await resolveClerkTokenFallback();
        }

        if (freshToken) {
          originalRequest.headers.Authorization = `Bearer ${freshToken}`;
          return api(originalRequest);
        }
      } catch (retryError) {
        console.error("Retry failed", retryError);
      }
    }

    if (isAuthError) {
      console.warn("Persistent auth failure. Clearing stale session.");
      delete api.defaults.headers.Authorization;
    }
    
    return Promise.reject(error);
  }
);

// ==============================
// Generic helpers (ensuring paths have trailing slash for Django)
// ==============================
function preparePath(path) {
  let [basePath, queryString] = path.split("?");
  let cleanPath = basePath.replace(/^\/+/, "").replace(/\/+$/, "");
  
  if (cleanPath) {
    cleanPath += "/";
  }
  
  return queryString ? `${cleanPath}?${queryString}` : cleanPath;
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

/** Authenticated binary download (e.g. PDF). */
export async function apiGetBlob(path) {
  try {
    const res = await api.get(preparePath(path), { responseType: "blob" });
    return res.data;
  } catch (err) {
    console.error(`API GET blob [${path}]:`, err.response?.status, err.response?.data || err.message);
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
  }
  if (!token) {
    token = await resolveClerkTokenFallback();
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

import { apiGet, apiPost } from "../api";

const buildFormData = (payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (value instanceof File) {
      formData.append(key, value);
    } else {
      formData.append(key, String(value));
    }
  });
  return formData;
};

const fetchWithFormData = async (path, method, payload) => {
  const base = (import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api").replace(/\/+$/, "");
  let token = null;
  if (typeof window !== "undefined" && window.Clerk?.session?.getToken) {
    token = await window.Clerk.session.getToken();
  }
  if (!token) {
    token = localStorage.getItem("access_token");
  }
  const res = await fetch(`${base}/${path.replace(/^\/+/, "")}`, {
    method,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: buildFormData(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }
  return res.json();
};

export const resourcesApi = {
  listResources() {
    return apiGet("resources/");
  },
  createResource(payload) {
    return fetchWithFormData("resources/", "POST", payload);
  },
  updateResource(id, payload) {
    return fetchWithFormData(`resources/${id}/`, "PATCH", payload);
  },
  deactivateResource(id) {
    return apiPost(`resources/${id}/deactivate/`, {});
  },
  listAssignments(clientId) {
    const query = clientId ? `?client=${clientId}` : "";
    return apiGet(`resource-assignments/${query}`);
  },
  assignResource(payload) {
    return apiPost("resource-assignments/", payload);
  },
  listClientAssignments() {
    return apiGet("client-resource-assignments/");
  },
  markAssignmentViewed(id) {
    return apiPost(`client-resource-assignments/${id}/mark_viewed/`, {});
  },
  markAssignmentCompleted(id) {
    return apiPost(`client-resource-assignments/${id}/mark_completed/`, {});
  },
};

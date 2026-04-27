import { apiGet, apiPost } from "../api.js";

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
  const base = ((typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_BASE : null) || 
                (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_API_BASE : null) || 
                "http://127.0.0.1:8000/api").replace(/\/+$/, "");
  let token = null;
  if (typeof window !== "undefined" && window.Clerk?.session?.getToken) {
    token = await window.Clerk.session.getToken();
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
  listFormAssignments(clientId) {
    const query = clientId ? `?client=${clientId}` : "";
    return apiGet(`client-form-assignments/${query}`);
  },
  listAssessmentCatalog() {
    return apiGet("client-form-assignments/assessment-catalog/");
  },
  assignAssessment({ assigned_to, assessment_id, due_date, instructions }) {
    return apiPost("client-form-assignments/", {
      assigned_to,
      form_type: "assessment",
      assessment_id,
      due_date,
      instructions,
    });
  },
  submitAssessmentResponse(id, response_data) {
    return apiPost(`client-form-assignments/${id}/submit_response/`, { response_data });
  },
};

import { apiGet } from "../api";

export async function fetchAssessmentRegistry() {
  const payload = await apiGet("client-form-assignments/assessment-catalog/");
  return payload?.assessments || [];
}

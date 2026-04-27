import { RESPONSE_SCALE_ERROR } from "../assessmentTypes";

export function validateAssessmentResponses(spec, responses) {
  const items = spec?.items || [];
  const allowedValues = new Set((spec?.responseScale || []).map((row) => row.value));
  if (!Array.isArray(responses) || responses.length !== items.length) {
    return { ok: false, error: RESPONSE_SCALE_ERROR };
  }

  const seen = new Set();
  for (const response of responses) {
    if (typeof response?.itemIndex !== "number") {
      return { ok: false, error: "Invalid response item index." };
    }
    if (seen.has(response.itemIndex)) {
      return { ok: false, error: "Duplicate item responses are not allowed." };
    }
    if (!allowedValues.has(response.value)) {
      return { ok: false, error: "Response value is outside allowed range." };
    }
    seen.add(response.itemIndex);
  }
  return { ok: seen.size === items.length, error: seen.size === items.length ? "" : RESPONSE_SCALE_ERROR };
}

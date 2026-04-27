import { DEFAULT_SCORING_OUTPUT } from "../assessmentTypes";
import { mapSeverity } from "./scoringUtils";
import { detectRiskFlags } from "../risk/detectRiskFlags";

export function scoreAssessment(spec, responses, previousScore = null) {
  const totalScore = responses.reduce((sum, row) => sum + Number(row.value || 0), 0);
  const severity = mapSeverity(totalScore, spec?.severityBands || []);
  const riskFlags = detectRiskFlags(spec, responses);
  const requiresImmediateReview = riskFlags.some((flag) => flag.requiresImmediateReview);

  const output = {
    ...DEFAULT_SCORING_OUTPUT,
    totalScore,
    severityLabel: severity.label || "",
    severityNumericLevel: severity.severityNumericLevel || 0,
    riskFlags,
    requiresImmediateReview,
  };

  if (previousScore !== null && previousScore !== undefined) {
    const changeScore = totalScore - Number(previousScore);
    output.changeScore = changeScore;
    output.clinicallySignificantChange = Math.abs(changeScore) >= 5;
  }
  return output;
}

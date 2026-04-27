export function generateAssessmentReport(assignment, spec, scoringOutput) {
  return {
    title: `${spec?.name || assignment?.title || "Assessment"} Report`,
    generatedAt: new Date().toISOString(),
    assessment: {
      id: spec?.id,
      name: spec?.name,
      abbreviation: spec?.abbreviation,
      version: spec?.version,
      scoringVersion: spec?.scoringVersion,
    },
    scores: scoringOutput,
    interpretation: `${scoringOutput?.severityLabel || "Unrated"} range. ${spec?.disclaimer || ""}`,
    responseSheet: assignment?.response_data?.responses || [],
  };
}

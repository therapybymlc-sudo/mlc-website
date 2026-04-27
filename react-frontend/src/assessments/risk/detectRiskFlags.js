export function detectRiskFlags(spec, responses) {
  const mapByItem = new Map(responses.map((row) => [row.itemIndex, Number(row.value || 0)]));
  return (spec?.riskFlags || [])
    .filter((rule) => mapByItem.get(rule.itemIndex) >= Number(rule.triggerMinValue || 999))
    .map((rule) => ({
      id: rule.id,
      label: rule.label,
      itemIndex: rule.itemIndex,
      responseValue: mapByItem.get(rule.itemIndex),
      requiresImmediateReview: Boolean(rule.requiresImmediateReview),
    }));
}

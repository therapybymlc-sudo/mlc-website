export function clampScore(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function mapSeverity(totalScore, severityBands = []) {
  return (
    severityBands.find((band) => totalScore >= band.min && totalScore <= band.max) || {
      label: "",
      severityNumericLevel: 0,
    }
  );
}

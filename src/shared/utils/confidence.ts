/** Colour of a confidence score (0–100): green from 85, amber from 65, red below. */
export function confidenceColor(value: number): 'success' | 'warning' | 'error' {
  if (value >= 85) return 'success';
  if (value >= 65) return 'warning';
  return 'error';
}
